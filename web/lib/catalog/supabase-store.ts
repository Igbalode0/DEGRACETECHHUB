import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { CatalogProduct, ProductRepo } from "./types";

// Supabase adapter — activates automatically when NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are set in .env.local (see supabase-schema.sql at
// the web root for the table + storage bucket to create). The service-role key
// is used server-side only; it never reaches the browser.

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  colors: string[];
  image_url: string | null;
  active: boolean;
  sold_out: boolean;
  rating: string;
  tag: string;
  created_at: string;
  updated_at: string;
};

const BUCKET = "product-images";

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

function fromRow(r: Row): CatalogProduct {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    price: r.price,
    category: r.category as CatalogProduct["category"],
    colors: r.colors ?? [],
    imageUrl: r.image_url,
    active: r.active,
    soldOut: r.sold_out,
    rating: r.rating,
    tag: r.tag,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function toRow(p: CatalogProduct): Row {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    category: p.category,
    colors: p.colors,
    image_url: p.imageUrl,
    active: p.active,
    sold_out: p.soldOut,
    rating: p.rating,
    tag: p.tag,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

export const supabaseRepo: ProductRepo = {
  async list() {
    const { data, error } = await supabase().from("products").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(`Supabase list failed: ${error.message}`);
    return (data as Row[]).map(fromRow);
  },

  async get(id) {
    const { data, error } = await supabase().from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Supabase get failed: ${error.message}`);
    return data ? fromRow(data as Row) : null;
  },

  async upsert(product) {
    const { error } = await supabase().from("products").upsert(toRow(product));
    if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  },

  async remove(id) {
    const { error } = await supabase().from("products").delete().eq("id", id);
    if (error) throw new Error(`Supabase delete failed: ${error.message}`);
  },

  async saveImage(fileName, bytes, contentType) {
    const { error } = await supabase()
      .storage.from(BUCKET)
      .upload(fileName, bytes, { contentType, upsert: true });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    return supabase().storage.from(BUCKET).getPublicUrl(fileName).data.publicUrl;
  },
};
