import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, ADDRESS } from "@/lib/data";
import styles from "@/components/Footer.module.css";

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.08A6.76 6.76 0 1 0 18.76 12 6.76 6.76 0 0 0 12 5.24zm0 11.15A4.39 4.39 0 1 1 16.39 12 4.39 4.39 0 0 1 12 16.39zm6.9-11.42a1.58 1.58 0 1 1-1.58-1.58 1.58 1.58 0 0 1 1.58 1.58z",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    path: "M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.2v12.53a2.52 2.52 0 1 1-2.52-2.52c.26 0 .5.04.74.11V9.85a5.7 5.7 0 0 0-.74-.05 5.73 5.73 0 1 0 5.73 5.73V9.01a7.35 7.35 0 0 0 4.3 1.38V7.19a4.28 4.28 0 0 1-3.25-1.37z",
  },
  {
    label: "WhatsApp",
    href: WHATSAPP_URL,
    path: "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12 2A10 10 0 0 0 3.48 17.16L2 22l4.94-1.3A10 10 0 1 0 12 2z",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brandCol}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>
              <span />
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoMain}>DE-GRACE</span>
              <span className={styles.logoSub}>TECH HUB</span>
            </span>
          </div>
          <p className={styles.blurb}>
            Your trusted destination for premium gadgets, expert repairs, and reliable technical support in Lagos.
          </p>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} aria-label={s.label} className={styles.socialLink}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Quick Links</h4>
          <Link href="/" className={styles.footerLink}>Home</Link>
          <Link href="/shop" className={styles.footerLink}>Shop</Link>
          <Link href="/repairs" className={styles.footerLink}>Repairs</Link>
          <Link href="/contact" className={styles.footerLink}>Contact</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Services</h4>
          <Link href="/repairs" className={styles.footerLink}>Device Repairs</Link>
          <Link href="/repairs" className={styles.footerLink}>Software Solutions</Link>
          <Link href="/shop" className={styles.footerLink}>Gadget Sales</Link>
          <Link href="/contact" className={styles.footerLink}>Support</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Get in touch</h4>
          <a href={`tel:${PHONE_TEL}`} className={styles.footerLink}>{PHONE_DISPLAY}</a>
          <a href={`mailto:${EMAIL}`} className={styles.footerLink} style={{ wordBreak: "break-all" }}>{EMAIL}</a>
          <span className={styles.contactLine}>{ADDRESS}</span>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
            <WhatsAppIcon width={16} height={16} />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span className={styles.bottomText}>© 2026 DE-GRACE TECH HUB. All Rights Reserved.</span>
        <span className={styles.bottomText}>Designed with precision in Lagos.</span>
      </div>
    </footer>
  );
}
