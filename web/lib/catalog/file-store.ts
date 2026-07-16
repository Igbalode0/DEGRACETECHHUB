import { promises as fs } from "fs";
import path from "path";
import { shopProducts } from "@/lib/data";
import type { CatalogProduct, ProductRepo } from "./types";

// Zero-setup adapter: products in data/catalog/products.json, images in
// data/uploads (served by app/uploads/[file]/route.ts). Seeded once from the
// static catalog in lib/data.ts so the admin panel starts populated.

const DATA_DIR = path.join(process.cwd(), "data", "catalog");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

function seed(): CatalogProduct[] {
  const now = new Date().toISOString();
  return shopProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: "",
    price: p.price,
    category: p.category,
    colors: [],
    imageUrl: null,
    active: true,
    soldOut: false,
    rating: p.rating,
    tag: p.tag,
    createdAt: now,
    updatedAt: now,
  }));
}

async function load(): Promise<CatalogProduct[]> {
  try {
    return JSON.parse(await fs.readFile(PRODUCTS_FILE, "utf8")) as CatalogProduct[];
  } catch {
    const seeded = seed();
    await save(seeded);
    return seeded;
  }
}

async function save(products: CatalogProduct[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf8");
}

export const fileRepo: ProductRepo = {
  async list() {
    return load();
  },

  async get(id) {
    return (await load()).find((p) => p.id === id) ?? null;
  },

  async upsert(product) {
    const products = await load();
    const i = products.findIndex((p) => p.id === product.id);
    if (i >= 0) products[i] = product;
    else products.unshift(product);
    await save(products);
  },

  async remove(id) {
    await save((await load()).filter((p) => p.id !== id));
  },

  async saveImage(fileName, bytes) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOADS_DIR, fileName), bytes);
    return `/uploads/${fileName}`;
  },
};
