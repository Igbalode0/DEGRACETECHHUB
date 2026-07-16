import { promises as fs } from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/catalog/file-store";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Serves images uploaded through the admin panel when running on the file
// store (Supabase mode serves from its public bucket URL instead).
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[file]">) {
  const { file } = await ctx.params;
  const name = path.basename(file); // no traversal
  const type = MIME[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const bytes = await fs.readFile(path.join(UPLOADS_DIR, name));
    return new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
