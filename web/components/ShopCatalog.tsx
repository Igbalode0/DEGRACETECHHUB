"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { shopCategories } from "@/lib/data";
import type { PublicProduct } from "@/lib/catalog/types";
import styles from "@/app/(site)/shop/shop.module.css";

const FILTERS = ["all", ...shopCategories] as const;
type Filter = (typeof FILTERS)[number];

const POLL_MS = 15_000;

export default function ShopCatalog({ initialProducts }: { initialProducts: PublicProduct[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [products, setProducts] = useState(initialProducts);

  // Keep the catalog live: admin edits show up in open tabs within seconds.
  useEffect(() => {
    const tick = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (res.ok) setProducts(await res.json());
      } catch {
        // transient network issue — keep showing the last good catalog
      }
    };
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const filtered = products.filter((p) => filter === "all" || p.category === filter);

  return (
    <>
      <section className={styles.chipsSection}>
        <div className={styles.chips}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.chip} ${f === filter ? styles.chipActive : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All Products" : f}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.countRow}>
          <span className={styles.countLabel}>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </span>
        </div>
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProductCard key={`${filter}-${p.id}`} product={p} showCategory />
          ))}
        </div>
      </section>
    </>
  );
}
