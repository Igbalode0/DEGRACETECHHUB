"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shopCategories, type ShopCategory } from "@/lib/data";
import { productRepo } from "@/lib/catalog/repo";
import type { CatalogProduct } from "@/lib/catalog/types";
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
  const colors = String(formData.get("colors") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .slice(0, 12);
  const tag = String(formData.get("tag") ?? "New").trim().slice(0, 20) || "New";
  const active = formData.get("active") === "on";
  const soldOut = formData.get("soldOut") === "on";

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
    const bytes = Buffer.from(await image.arrayBuffer());
    imageUrl = await repo.saveImage(`${randomUUID()}${ext}`, bytes, image.type);
  }

  const now = new Date().toISOString();
  const product: CatalogProduct = {
    id: existing?.id ?? randomUUID().slice(0, 8),
    name,
    slug: slugify(name),
    description,
    price,
    category,
    colors,
    imageUrl,
    active,
    soldOut,
    rating: existing?.rating ?? "4.5",
    tag,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
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
