import type { ProductColor, ProductMedia, PublicProduct, CatalogProduct } from "./types";

// Pure helpers shared by the admin editor and the storefront. Products saved
// before the media manager existed only have `imageUrl` + `images` + `colors`,
// so everything reads through these adapters rather than the raw fields — old
// products keep working and are upgraded in place the next time they're saved.

export function slugId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Reasonable swatch guesses so the admin rarely has to touch the colour picker. */
const KNOWN_COLORS: Record<string, string> = {
  black: "#1c1c1e",
  space: "#3a3a3c",
  graphite: "#4a4a4d",
  grey: "#8e8e93",
  gray: "#8e8e93",
  silver: "#e3e4e6",
  white: "#f5f5f7",
  gold: "#e8c9a0",
  rose: "#e8b4b8",
  blue: "#2f5fdc",
  navy: "#1e3a8a",
  green: "#3fae63",
  red: "#e0393e",
  purple: "#8b6fd6",
  orange: "#f08a3c",
  yellow: "#f2c744",
  pink: "#f0a2c0",
  titanium: "#8a8a8f",
  natural: "#c9c3ba",
  cream: "#efe7d9",
};

export function guessHex(name: string): string {
  const key = Object.keys(KNOWN_COLORS).find((k) => name.toLowerCase().includes(k));
  return key ? KNOWN_COLORS[key] : "#8e8e93";
}

/** Structured colours, upgrading the legacy string[] when needed. */
export function colorsOf(p: Pick<CatalogProduct, "colorOptions" | "colors">): ProductColor[] {
  if (p.colorOptions && p.colorOptions.length > 0) return p.colorOptions;
  return (p.colors ?? []).map((name, i) => ({
    id: `c_legacy_${i}`,
    name,
    hex: guessHex(name),
    stock: null,
    sku: null,
  }));
}

/** The media library, upgrading legacy imageUrl/images when needed. */
export function mediaOf(p: Pick<CatalogProduct, "media" | "imageUrl" | "images">): ProductMedia[] {
  if (p.media && p.media.length > 0) return [...p.media].sort((a, b) => a.sort - b.sort);
  const legacy = [p.imageUrl, ...(p.images ?? [])].filter((u): u is string => Boolean(u));
  return legacy.map((url, i) => ({
    id: `m_legacy_${i}`,
    kind: "image" as const,
    url,
    colorId: null,
    view: i === 0 ? ("front" as const) : ("other" as const),
    sort: i,
  }));
}

/** The image shown in listings: the chosen cover, else the first item. */
export function coverOf(p: Pick<CatalogProduct, "media" | "imageUrl" | "images" | "coverMediaId">): string | null {
  const all = mediaOf(p);
  const cover = p.coverMediaId ? all.find((m) => m.id === p.coverMediaId) : undefined;
  return (cover ?? all[0])?.url ?? p.imageUrl ?? null;
}

/**
 * Gallery for a selected colour, with deliberate graceful degradation:
 *
 *   1. shots tagged to this colour, then shared (untagged) shots as filler
 *   2. if the colour has no shots of its own, the shared set
 *   3. if nothing is shared either, the whole library
 *
 * So a colour with three photos still presents a full gallery alongside a
 * colour with eight, and nothing has to be complete before launch.
 */
export function mediaForColor(all: ProductMedia[], colorId: string | null): ProductMedia[] {
  if (all.length === 0) return [];
  const shared = all.filter((m) => m.colorId === null);
  if (!colorId) return shared.length > 0 ? shared : all;

  const exact = all.filter((m) => m.colorId === colorId);
  if (exact.length > 0) return [...exact, ...shared];
  return shared.length > 0 ? shared : all;
}

/** True when this colour has at least one dedicated shot (drives admin hints). */
export function colorHasOwnMedia(all: ProductMedia[], colorId: string): boolean {
  return all.some((m) => m.colorId === colorId);
}

/** Storefront convenience: everything the gallery needs for a product. */
export function galleryFor(product: PublicProduct, colorId: string | null) {
  return mediaForColor(mediaOf(product), colorId);
}
