import sharp from "sharp";

// Uploaded product shots arrive with wildly different framing: a transparent
// PNG with 30% empty margin, a JPEG on a white studio sweep, a tight crop.
// Normalising them here — rather than papering over it with CSS — is what lets
// the gallery present every product at the same commanding size.

const MAX_EDGE = 1600;
/** How close to the border colour a pixel must be to count as padding. */
const TRIM_THRESHOLD = 12;
/**
 * Only refuse a trim that leaves something degenerate. A product filling a few
 * percent of an oversized canvas is precisely the case worth fixing, so this
 * guard has to stay well below the padding ratios we expect to see.
 */
const MIN_KEPT_AREA = 0.002;
const MIN_KEPT_EDGE = 32;

export type PreparedImage = {
  bytes: Buffer;
  ext: string;
  contentType: string;
  width: number;
  height: number;
  trimmed: boolean;
};

/**
 * Trims uniform or transparent padding, caps the long edge and re-encodes to
 * WebP. Photographs whose edges carry real detail are left alone: sharp's trim
 * only removes a border that is genuinely one flat colour.
 */
export async function prepareProductImage(input: Buffer): Promise<PreparedImage> {
  const original = sharp(input, { failOn: "none" });
  const meta = await original.metadata();
  const originalArea = (meta.width ?? 0) * (meta.height ?? 0);

  let pipeline = sharp(input, { failOn: "none" }).rotate(); // honour EXIF orientation
  let trimmed = false;

  if (originalArea > 0) {
    try {
      const candidate = await sharp(input, { failOn: "none" })
        .rotate()
        .trim({ threshold: TRIM_THRESHOLD })
        .toBuffer({ resolveWithObject: true });

      const keptArea = candidate.info.width * candidate.info.height;
      // A trim that leaves almost nothing means the image was blank or the
      // subject blends into its background — keep the original in that case.
      const degenerate =
        keptArea / originalArea < MIN_KEPT_AREA ||
        candidate.info.width < MIN_KEPT_EDGE ||
        candidate.info.height < MIN_KEPT_EDGE;
      if (!degenerate) {
        pipeline = sharp(candidate.data, { failOn: "none" });
        trimmed = keptArea < originalArea * 0.99;
      }
    } catch {
      // trim can throw on images that are entirely one colour — keep original
    }
  }

  const bytes = await pipeline
    .resize(MAX_EDGE, MAX_EDGE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();

  const out = await sharp(bytes).metadata();
  return {
    bytes,
    ext: ".webp",
    contentType: "image/webp",
    width: out.width ?? 0,
    height: out.height ?? 0,
    trimmed,
  };
}
