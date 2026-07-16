import { listPublicProducts } from "@/lib/catalog/repo";

// Public catalog feed — the shop page polls this so admin changes appear in
// already-open customer tabs without a reload.
export async function GET() {
  const products = await listPublicProducts();
  return Response.json(products, { headers: { "Cache-Control": "no-store" } });
}
