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
};

/** What the customer-facing site (and its polling endpoint) receives. */
export type PublicProduct = Pick<
  CatalogProduct,
  "id" | "name" | "slug" | "description" | "price" | "category" | "colors" | "imageUrl" | "soldOut" | "rating" | "tag"
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
  };
}
