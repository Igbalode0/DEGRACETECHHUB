import type { ShopCategory } from "@/lib/data";

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
  /** Extra gallery shots beyond imageUrl, in display order. */
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
    storageOptions: p.storageOptions,
    features: p.features,
    specs: p.specs,
    included: p.included,
  };
}
