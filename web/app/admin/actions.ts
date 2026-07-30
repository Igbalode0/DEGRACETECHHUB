"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shopCategories, type ShopCategory } from "@/lib/data";
import { productRepo } from "@/lib/catalog/repo";
import { prepareProductImage } from "@/lib/catalog/image-processing";
import { VIEW_TYPES, type CatalogProduct, type MediaKind, type ProductColor, type ProductMedia, type ViewType } from "@/lib/catalog/types";
import { checkPassword, createAdminSession, destroyAdminSession, requireAdmin } from "@/lib/admin/auth";

// Every mutation revalidates the customer-facing pages, so a save in the
// admin panel is live on the site immediately (open tabs also poll
// /api/products, so they refresh without a reload).
function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin");
}

// ---- Auth ------------------------------------------------------------------

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) redirect("/admin/login?error=1");
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---- Products ----------------------------------------------------------------

export type SaveProductResult = { ok: true } | { ok: false; error: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

/** "128GB, 256GB" -> ["128GB", "256GB"] */
function splitList(value: FormDataEntryValue | null, max: number): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** One entry per line, blank lines dropped. */
function parseLines(value: FormDataEntryValue | null, max: number): string[] {
  return String(value ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "product";
}

export async function saveProductAction(formData: FormData): Promise<SaveProductResult> {
  await requireAdmin();
  const repo = productRepo();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim().slice(0, 300);
  const price = Math.round(Number(formData.get("price")));
  const category = String(formData.get("category") ?? "") as ShopCategory;
  const tag = String(formData.get("tag") ?? "New").trim().slice(0, 20) || "New";
  const active = formData.get("active") === "on";
  const soldOut = formData.get("soldOut") === "on";

  // Rich Quick View content, all entered as plain text in the admin form.
  const storageOptions = splitList(formData.get("storageOptions"), 8);
  const included = splitList(formData.get("included"), 12);
  const features = parseLines(formData.get("features"), 10).map((line) => {
    const [icon, ...rest] = line.split("|");
    const label = rest.join("|").trim();
    return label ? { icon: icon.trim().slice(0, 4), label: label.slice(0, 60) } : { icon: "✦", label: line.slice(0, 60) };
  });
  const specs = parseLines(formData.get("specs"), 30)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx < 1) return null;
      return { label: line.slice(0, idx).trim().slice(0, 40), value: line.slice(idx + 1).trim().slice(0, 120) };
    })
    .filter((s): s is { label: string; value: string } => s !== null && s.value.length > 0);

  if (!name) return { ok: false, error: "Product name is required." };
  if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "Enter a valid price in naira." };
  if (!shopCategories.includes(category)) return { ok: false, error: "Pick a category." };

  const existing = id ? await repo.get(id) : null;
  if (id && !existing) return { ok: false, error: "This product no longer exists." };

  let imageUrl = existing?.imageUrl ?? null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const ext = IMAGE_TYPES[image.type];
    if (!ext) return { ok: false, error: "Image must be JPEG, PNG, WebP, GIF or AVIF." };
    if (image.size > MAX_IMAGE_BYTES) return { ok: false, error: "Image is too large (max 5 MB)." };
    // Trimmed and normalised so the gallery can size it confidently.
    const prepared = await prepareProductImage(Buffer.from(await image.arrayBuffer()));
    imageUrl = await repo.saveImage(`${randomUUID()}${prepared.ext}`, prepared.bytes, prepared.contentType);
  }

  // ---- colours ----
  // The editor sends the full colour list as JSON; ids are stable so media
  // tagged to a colour survives renames and reordering.
  let colorOptions: ProductColor[] = [];
  try {
    const raw = JSON.parse(String(formData.get("colorsJson") ?? "[]")) as ProductColor[];
    colorOptions = raw
      .filter((c) => c && typeof c.name === "string" && c.name.trim())
      .slice(0, 24)
      .map((c) => ({
        id: String(c.id || randomUUID().slice(0, 8)),
        name: c.name.trim().slice(0, 40),
        hex: /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex.toLowerCase() : "#8e8e93",
        stock: c.stock === null || c.stock === undefined || c.stock === ("" as unknown) ? null : Math.max(0, Math.round(Number(c.stock) || 0)),
        sku: c.sku ? String(c.sku).trim().slice(0, 40) : null,
      }));
  } catch {
    return { ok: false, error: "Colour data was malformed — please re-open the editor and try again." };
  }
  const colorIds = new Set(colorOptions.map((c) => c.id));

  // ---- media library ----
  // Each entry either points at an already-stored url, or carries an upload
  // index into the "newFiles" list. Order in the array is the gallery order.
  type IncomingMedia = {
    id?: string;
    kind?: MediaKind;
    url?: string;
    uploadIndex?: number;
    colorId?: string | null;
    view?: ViewType;
    alt?: string;
  };

  const newFiles = formData.getAll("newFiles").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls: string[] = [];
  for (const file of newFiles.slice(0, 40)) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return { ok: false, error: `"${file.name}" must be JPEG, PNG, WebP, GIF or AVIF.` };
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: `"${file.name}" is too large (max 5 MB).` };
    const prepared = await prepareProductImage(Buffer.from(await file.arrayBuffer()));
    uploadedUrls.push(await repo.saveImage(`${randomUUID()}${prepared.ext}`, prepared.bytes, prepared.contentType));
  }

  let media: ProductMedia[] = [];
  try {
    const raw = JSON.parse(String(formData.get("mediaJson") ?? "[]")) as IncomingMedia[];
    media = raw
      .map((m, i): ProductMedia | null => {
        const url = typeof m.uploadIndex === "number" ? uploadedUrls[m.uploadIndex] : m.url;
        if (!url) return null;
        return {
          id: String(m.id || randomUUID().slice(0, 8)),
          kind: (m.kind ?? "image") as MediaKind,
          url,
          // a tag pointing at a deleted colour falls back to "shared"
          colorId: m.colorId && colorIds.has(m.colorId) ? m.colorId : null,
          view: (VIEW_TYPES as readonly string[]).includes(m.view ?? "") ? (m.view as ViewType) : "other",
          alt: m.alt ? String(m.alt).slice(0, 120) : undefined,
          sort: i,
        };
      })
      .filter((m): m is ProductMedia => m !== null);
  } catch {
    return { ok: false, error: "Media data was malformed — please re-open the editor and try again." };
  }

  const requestedCover = String(formData.get("coverMediaId") ?? "");
  const coverMediaId = media.some((m) => m.id === requestedCover) ? requestedCover : (media[0]?.id ?? null);
  // imageUrl stays in sync so listings, the chatbot and older code keep working.
  imageUrl = media.find((m) => m.id === coverMediaId)?.url ?? imageUrl;

  const now = new Date().toISOString();
  const product: CatalogProduct = {
    id: existing?.id ?? randomUUID().slice(0, 8),
    name,
    slug: slugify(name),
    description,
    price,
    category,
    colors: colorOptions.map((c) => c.name),
    colorOptions,
    media,
    coverMediaId,
    imageUrl,
    active,
    soldOut,
    rating: existing?.rating ?? "4.5",
    tag,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    storageOptions,
    features,
    specs,
    included,
  };

  await repo.upsert(product);
  revalidateSite();
  return { ok: true };
}

export async function toggleActiveAction(id: string) {
  await requireAdmin();
  const repo = productRepo();
  const p = await repo.get(id);
  if (!p) return;
  await repo.upsert({ ...p, active: !p.active, updatedAt: new Date().toISOString() });
  revalidateSite();
}

export async function toggleSoldOutAction(id: string) {
  await requireAdmin();
  const repo = productRepo();
  const p = await repo.get(id);
  if (!p) return;
  await repo.upsert({ ...p, soldOut: !p.soldOut, updatedAt: new Date().toISOString() });
  revalidateSite();
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await productRepo().remove(id);
  revalidateSite();
}
