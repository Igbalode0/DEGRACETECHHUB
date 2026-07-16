import type { ProductRepo, PublicProduct } from "./types";
import { toPublic } from "./types";
import { fileRepo } from "./file-store";

// One import point for product storage. With Supabase keys in .env.local the
// hosted database + storage bucket take over; otherwise the file store runs.
export function productRepo(): ProductRepo {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Lazy require keeps the file-store path free of the supabase dependency.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require("./supabase-store") as typeof import("./supabase-store")).supabaseRepo;
  }
  return fileRepo;
}

/** Active products only — what customers (pages, /api/products, chatbot) see. */
export async function listPublicProducts(): Promise<PublicProduct[]> {
  return (await productRepo().list()).filter((p) => p.active).map(toPublic);
}
