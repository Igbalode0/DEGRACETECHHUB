import type { Metadata } from "next";
import ShopCatalog from "@/components/ShopCatalog";
import { listPublicProducts } from "@/lib/catalog/repo";
import styles from "./shop.module.css";

export const metadata: Metadata = {
  title: "Shop — DE-GRACE TECH HUB",
  description:
    "Genuine devices and accessories with warranty. Browse the latest smartphones, laptops, tablets and more.",
};

export default async function ShopPage() {
  const products = await listPublicProducts();
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Shop the collection</div>
          <h1 className={styles.h1}>Premium Gadgets, Ready to Ship</h1>
          <p className={styles.heroText}>
            Genuine devices and accessories with warranty. Browse the latest smartphones, laptops, tablets and more.
          </p>
        </div>
      </section>
      <ShopCatalog initialProducts={products} />
      <div className={styles.footerSpacer} />
    </div>
  );
}
