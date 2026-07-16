"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { CartIcon, MenuIcon } from "@/components/icons";
import styles from "@/components/Nav.module.css";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Repairs", href: "/repairs" },
  { label: "Contact", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <span />
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoMain}>DE-GRACE</span>
              <span className={styles.logoSub}>TECH HUB</span>
            </span>
          </Link>

          <nav className={styles.links}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${pathname === link.href ? styles.linkActive : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.right}>
            <button type="button" aria-label="Open cart" className={styles.cartBtn} onClick={openCart}>
              <CartIcon />
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </button>
            <Link href="/repairs" className={styles.bookBtn}>
              Book a Repair
            </Link>
            <button
              type="button"
              aria-label="Menu"
              className={styles.menuBtn}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/repairs" className={styles.mobileBook} onClick={() => setMenuOpen(false)}>
              Book a Repair
            </Link>
          </div>
        )}
      </div>
      <div className={styles.spacer} />
    </>
  );
}
