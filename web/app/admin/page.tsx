import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { productRepo } from "@/lib/catalog/repo";
import { logoutAction } from "@/app/admin/actions";
import AdminDashboard from "@/components/admin/AdminDashboard";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin — DE-GRACE TECH HUB",
  robots: { index: false },
};

export default async function AdminPage() {
  await requireAdmin();
  const products = await productRepo().list();

  const stats = {
    total: products.length,
    live: products.filter((p) => p.active && !p.soldOut).length,
    soldOut: products.filter((p) => p.soldOut).length,
    hidden: products.filter((p) => !p.active).length,
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div>
          <h1 className={styles.h1}>Product Dashboard</h1>
          <p className={styles.sub}>Changes go live on the shop instantly.</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className={styles.ghostBtn}>
            Sign out
          </button>
        </form>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statNum}>{stats.total}</div>
          <div className={styles.statLabel}>Products</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statNum} ${styles.good}`}>{stats.live}</div>
          <div className={styles.statLabel}>Live in shop</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statNum} ${styles.warn}`}>{stats.soldOut}</div>
          <div className={styles.statLabel}>Sold out</div>
        </div>
        <div className={styles.stat}>
          <div className={`${styles.statNum} ${styles.dim}`}>{stats.hidden}</div>
          <div className={styles.statLabel}>Hidden</div>
        </div>
      </div>

      <AdminDashboard products={products} />
    </div>
  );
}
