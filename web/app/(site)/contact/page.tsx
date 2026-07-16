import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/ContactForm";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/icons";
import { ADDRESS, EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/lib/data";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact — DE-GRACE TECH HUB",
  description:
    "Questions about a product, a repair, or your order? Reach out any way you like — we respond fast, especially on WhatsApp.",
};

const MAPS_URL = "https://maps.google.com/?q=Lagos+Nigeria";

const DETAILS = [
  { label: "Phone Number", value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}`, external: false, Icon: PhoneIcon },
  { label: "WhatsApp", value: PHONE_DISPLAY, href: WHATSAPP_URL, external: true, Icon: WhatsAppIcon },
  { label: "Email", value: EMAIL, href: `mailto:${EMAIL}`, external: false, Icon: MailIcon },
  { label: "Business Address", value: ADDRESS, href: MAPS_URL, external: true, Icon: PinIcon },
  { label: "Business Hours", value: "Mon – Sat: 9:00 AM – 7:00 PM", href: "#", external: false, Icon: ClockIcon },
];

export default function ContactPage() {
  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Contact us</div>
          <h1 className={styles.h1}>We&apos;re Here to Help</h1>
          <p className={styles.heroText}>
            Questions about a product, a repair, or your order? Reach out any way you like — we respond fast,
            especially on WhatsApp.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.grid}>
          {/* LEFT: details + form */}
          <div className={styles.leftCol}>
            <Reveal className={styles.card}>
              <div className={styles.detailGrid}>
                {DETAILS.map(({ label, value, href, external, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className={styles.detailLink}
                  >
                    <span className={styles.detailIcon}>
                      <Icon width={22} height={22} />
                    </span>
                    <div className={styles.detailText}>
                      <div className={styles.detailLabel}>{label}</div>
                      <div className={styles.detailValue}>{value}</div>
                    </div>
                  </a>
                ))}
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                <WhatsAppIcon />
                Chat on WhatsApp
              </a>
            </Reveal>

            <Reveal className={styles.card}>
              <h3 className={styles.formTitle}>Send us a message</h3>
              <ContactForm />
            </Reveal>
          </div>

          {/* RIGHT: map + hours */}
          <Reveal className={styles.rightCol}>
            <div className={`${styles.mapBox} placeholder-fill`}>
              <div className={styles.mapGlow} />
              <div className={styles.mapInner}>
                <PinIcon width={38} height={38} stroke="#60a5fa" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                <div className="placeholder-label">[ EMBEDDED GOOGLE MAP ]</div>
                <div className={styles.mapAddr}>{ADDRESS}</div>
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className={styles.mapLink}>
                  Open in Google Maps →
                </a>
              </div>
            </div>
            <div className={styles.hoursCard}>
              <div className={styles.hoursHead}>
                <span className={styles.hoursIcon}>
                  <ClockIcon width={20} height={20} />
                </span>
                <div className={styles.hoursTitle}>Business Hours</div>
              </div>
              <div className={styles.hoursRow}>
                <span className={styles.hoursDay}>Monday – Saturday</span>
                <span className={styles.hoursTime}>9:00 AM – 7:00 PM</span>
              </div>
              <div className={`${styles.hoursRow} ${styles.last}`}>
                <span className={styles.hoursDay}>Sunday</span>
                <span className={styles.hoursClosed}>Closed</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className={styles.footerSpacer} />
    </div>
  );
}
