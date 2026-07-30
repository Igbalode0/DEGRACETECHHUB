import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import ProductArt, { type ArtKind } from "@/components/ProductArt";
import QuickViewTrigger from "@/components/quickview/QuickViewTrigger";
import { listPublicProducts } from "@/lib/catalog/repo";
import { naira } from "@/lib/format";
import styles from "@/components/PremiumCollection.module.css";

// Flagship product showcase. Each card is anchored to a real product family in
// the catalog, so the "starting from" price and stock line stay truthful as the
// admin panel changes — never hardcoded marketing copy that can go stale.

type Highlight = {
  key: string;
  /** Matched case-insensitively against product names to build the family. */
  match: string;
  title: string;
  label: string;
  description: string;
  art: ArtKind;
};

const HIGHLIGHTS: Highlight[] = [
  {
    key: "iphone",
    match: "iphone",
    title: "iPhone",
    label: "New",
    description: "Unmatched speed, all-day battery and a camera system that keeps up with you.",
    art: "phone",
  },
  {
    key: "macbook",
    match: "macbook",
    title: "MacBook",
    label: "Best seller",
    description: "Featherlight builds with the power to carry a full workday and then some.",
    art: "laptop",
  },
  {
    key: "apple-watch",
    match: "apple watch",
    title: "Apple Watch",
    label: "Popular",
    description: "Fitness, health and your notifications — all on the wrist, all day long.",
    art: "watch",
  },
  {
    key: "airpods",
    match: "airpods",
    title: "AirPods",
    label: "Limited stock",
    description: "Immersive sound with active noise cancellation and effortless pairing.",
    art: "earbuds",
  },
];

const IMAGE_DIR = path.join(process.cwd(), "public", "images", "products");
const IMAGE_EXTS = [".png", ".webp", ".avif", ".jpg"];

/**
 * Real transparent product renders live in public/images/products/<key>.<ext>.
 * Until one is dropped in, the card falls back to the schematic line-art so the
 * section never renders a broken or empty stage.
 */
async function findRender(key: string): Promise<string | null> {
  for (const ext of IMAGE_EXTS) {
    try {
      await fs.access(path.join(IMAGE_DIR, key + ext));
      return `/images/products/${key}${ext}`;
    } catch {
      // try the next extension
    }
  }
  return null;
}

export default async function PremiumCollection() {
  const products = await listPublicProducts();

  const cards = await Promise.all(
    HIGHLIGHTS.map(async (h) => {
      const family = products.filter((p) => p.name.toLowerCase().includes(h.match));
      const available = family.filter((p) => !p.soldOut);
      const from = available.length > 0 ? Math.min(...available.map((p) => p.price)) : null;
      // The cheapest in-stock unit is what "starting from" refers to, so that
      // is the one the Quick View opens on.
      const anchor =
        available.slice().sort((a, b) => a.price - b.price)[0] ?? family[0] ?? null;
      return { ...h, render: await findRender(h.key), inStock: available.length > 0, from, anchor };
    }),
  );

  return (
    <section className={styles.showcase} aria-labelledby="premium-collection-title">
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.lightA} />
        <div className={styles.lightB} />
        <span className={`${styles.particle} ${styles.p1}`} />
        <span className={`${styles.particle} ${styles.p2}`} />
        <span className={`${styles.particle} ${styles.p3}`} />
        <span className={`${styles.particle} ${styles.p4}`} />
        <span className={`${styles.particle} ${styles.p5}`} />
      </div>

      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className={styles.accentLine} />
          <h2 id="premium-collection-title" className={styles.title}>
            Premium Collection
          </h2>
          <p className={styles.subtitle}>
            Discover the latest smartphones, laptops, wearables and accessories carefully selected for performance and
            reliability.
          </p>
        </Reveal>

        <ul className={styles.rail}>
          {cards.map((c, i) => (
            <Reveal as="li" key={c.key} delayMs={i * 90} className={styles.cardWrap}>
              <article className={styles.card}>
                <div className={styles.cardHead}>
                  <span className={styles.label}>{c.label}</span>
                  <h3 className={styles.name}>{c.title}</h3>
                  <p className={styles.desc}>{c.description}</p>
                </div>

                <div className={styles.stage}>
                  {c.render ? (
                    <Image
                      src={c.render}
                      alt={`${c.title} available at DE-GRACE TECH HUB`}
                      className={styles.shot}
                      width={420}
                      height={420}
                      sizes="(max-width: 700px) 78vw, (max-width: 1100px) 40vw, 22vw"
                      loading="lazy"
                    />
                  ) : (
                    <span className={styles.shot}>
                      <ProductArt kind={c.art} size={128} />
                    </span>
                  )}
                  <span className={styles.shadow} aria-hidden="true" />
                </div>

                <div className={styles.cardFoot}>
                  <div className={styles.meta}>
                    {c.inStock ? (
                      <span className={styles.stock}>
                        <span className={styles.tick} aria-hidden="true">
                          ✓
                        </span>
                        In stock
                      </span>
                    ) : (
                      <span className={`${styles.stock} ${styles.stockOut}`}>Sold out</span>
                    )}
                    {c.from !== null && <span className={styles.price}>Starting from {naira(c.from)}</span>}
                  </div>
                  {c.anchor ? (
                    <QuickViewTrigger product={c.anchor} className={styles.pill} ariaLabel={`View ${c.title} details`}>
                      <span className={styles.pillLabel}>
                        View Product <span aria-hidden="true">→</span>
                      </span>
                    </QuickViewTrigger>
                  ) : (
                    <Link href="/shop" className={styles.pill}>
                      <span className={styles.pillLabel}>
                        View Product <span aria-hidden="true">→</span>
                        <span className={styles.srOnly}> — {c.title}</span>
                      </span>
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
