import type { Metadata } from "next";
import Link from "next/link";
import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin — DE-GRACE TECH HUB",
  robots: { index: false },
};

// Standalone admin chrome — no store navigation, cart, footer, or chat widget.
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.adminShell}>
      <header className={styles.adminBar}>
        <div className={styles.adminBrand}>
          <span className={styles.adminBadge}>DG</span>
          <span className={styles.adminBrandText}>
            DE-GRACE <span className={styles.adminBrandDim}>Admin</span>
          </span>
        </div>
        <Link href="/" className={styles.viewSiteLink} target="_blank">
          View live site ↗
        </Link>
      </header>
      <main className={styles.adminMain}>{children}</main>
    </div>
  );
}
