import type { ShopCategory } from "@/lib/data";

/**
 * Media kinds. Only "image" is produced today, but every consumer switches on
 * this field, so adding "video" or "spin" later is additive — no shape changes
 * to ProductMedia and no migration of existing rows.
 */
export type MediaKind = "image" | "video" | "spin";

export const VIEW_TYPES = [
  "front",
  "back",
  "left",
  "right",
  "top",
  "bottom",
  "angle",
  "closeup",
  "lifestyle",
  "packaging",
  "other",
] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

export type ProductMedia = {
  id: string;
  kind: MediaKind;
  /** Public URL (local /uploads or Supabase Storage). For spin sets, the first frame. */
  url: string;
  /** Colour this asset belongs to; null means it is shared across all colours. */
  colorId: string | null;
  view: ViewType;
  alt?: string;
  /** Display order within the gallery, ascending. */
  sort: number;
};

export type ProductColor = {
  id: string;
  name: string;
  /** Swatch fill, e.g. "#1c1c1e". */
  hex: string;
  /** Units on hand for this colour; null when the shop doesn't track per-colour. */
  stock?: number | null;
  sku?: string | null;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: ShopCategory;
  /** Available colour options, e.g. ["Black", "Silver"]. */
  colors: string[];
  /** URL served by /uploads/[file] (file store) or Supabase Storage (public URL). */
  imageUrl: string | null;
  /** Hidden from the customer site when false. */
  active: boolean;
  /** Shown but not purchasable when true. */
  soldOut: boolean;
  rating: string;
  tag: string;
  createdAt: string;
  updatedAt: string;

  // ---- Optional rich detail, surfaced in the Quick View ----
  // Each is rendered only when present, so nothing is ever invented for a
  // product the shop actually sells.
  /** Structured colours: swatch, per-colour stock and SKU. */
  colorOptions?: ProductColor[];
  /** The full media library for this product, in display order. */
  media?: ProductMedia[];
  /** Which media item represents the product in listings. */
  coverMediaId?: string | null;
  /** Legacy: extra gallery shots beyond imageUrl. Superseded by `media`. */
  images?: string[];
  /** e.g. ["128GB", "256GB", "512GB"] */
  storageOptions?: string[];
  /** Highlight cards, e.g. { icon: "📸", label: "48MP Triple Camera" } */
  features?: { icon: string; label: string }[];
  /** Accordion rows, e.g. { label: "Battery", value: "4,441 mAh" } */
  specs?: { label: string; value: string }[];
  /** In-the-box items, e.g. ["Phone", "USB-C Cable", "SIM Tool"] */
  included?: string[];
};

/** What the customer-facing site (and its polling endpoint) receives. */
export type PublicProduct = Pick<
  CatalogProduct,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "price"
  | "category"
  | "colors"
  | "imageUrl"
  | "soldOut"
  | "rating"
  | "tag"
  | "images"
  | "colorOptions"
  | "media"
  | "coverMediaId"
  | "storageOptions"
  | "features"
  | "specs"
  | "included"
>;

export type ProductRepo = {
  list(): Promise<CatalogProduct[]>;
  get(id: string): Promise<CatalogProduct | null>;
  upsert(product: CatalogProduct): Promise<void>;
  remove(id: string): Promise<void>;
  /** Stores an image and returns the URL it will be served from. */
  saveImage(fileName: string, bytes: Buffer, contentType: string): Promise<string>;
};

export function toPublic(p: CatalogProduct): PublicProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    category: p.category,
    colors: p.colors,
    imageUrl: p.imageUrl,
    soldOut: p.soldOut,
    rating: p.rating,
    tag: p.tag,
    images: p.images,
    colorOptions: p.colorOptions,
    media: p.media,
    coverMediaId: p.coverMediaId,
    storageOptions: p.storageOptions,
    features: p.features,
    specs: p.specs,
    included: p.included,
  };
}
