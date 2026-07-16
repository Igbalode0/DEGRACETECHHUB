import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import BookingForm from "@/components/BookingForm";
import { CheckIcon, ClockIcon, RepairIcon, SoftwareIcon } from "@/components/icons";
import { guarantees, repairPrices, repairServices, steps, WHATSAPP_URL } from "@/lib/data";
import styles from "./repairs.module.css";

export const metadata: Metadata = {
  title: "Repairs — DE-GRACE TECH HUB",
  description:
    "Cracked screen, dead battery, water damage, or a software issue? Our certified technicians fix it fast — with genuine parts and a warranty on every repair.",
};

const SERVICE_ICONS = {
  repairs: RepairIcon,
  software: SoftwareIcon,
} as const;

export default function RepairsPage() {
  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span className={styles.badgeText}>Same-day service available</span>
          </div>
          <h1 className={styles.h1}>Expert Repairs You Can Trust</h1>
          <p className={styles.heroText}>
            Cracked screen, dead battery, water damage, or a software issue? Our certified technicians fix it fast —
            with genuine parts and a warranty on every repair.
          </p>
          <div className={styles.heroBtns}>
            <a href="#book" className={styles.btnPrimary}>
              Book a Repair
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.btnWhatsapp}>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHead}>
          <div className={styles.eyebrow}>What we fix</div>
          <h2 className={styles.sectionTitle}>GadgetCare Sales &amp; Repairs</h2>
        </Reveal>
        <div className={styles.servicesGrid}>
          {repairServices.map((svc) => {
            const Icon = SERVICE_ICONS[svc.key];
            return (
              <Reveal key={svc.key} className={styles.serviceCard}>
                <div className={styles.serviceHead}>
                  <div className={styles.serviceIcon}>
                    <Icon />
                  </div>
                  <h3 className={styles.serviceTitle}>{svc.title}</h3>
                </div>
                <div className={styles.serviceItems}>
                  {svc.items.map((item) => (
                    <div key={item} className={styles.serviceItem}>
                      <span className={styles.serviceCheck}>
                        <CheckIcon width={12} height={12} />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHead}>
          <div className={styles.eyebrow}>Transparent pricing</div>
          <h2 className={styles.sectionTitle}>Common Repair Estimates</h2>
          <p className={styles.sectionNote}>Final price confirmed after a free diagnosis. Prices vary by device model.</p>
        </Reveal>
        <div className={styles.priceGrid}>
          {repairPrices.map((pr) => (
            <Reveal key={pr.label} className={styles.priceRow}>
              <span className={styles.priceLabel}>{pr.label}</span>
              <span className={styles.priceValue}>from {pr.price}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className={styles.section}>
        <Reveal as="div" className={`${styles.sectionHead} ${styles.centered}`}>
          <div className={styles.eyebrow}>How it works</div>
          <h2 className={styles.sectionTitle}>The Repair Process</h2>
        </Reveal>
        <div className={styles.processGrid}>
          {steps.map((st) => (
            <Reveal key={st.n} className={styles.stepCard}>
              <div className={styles.stepNum}>{st.n}</div>
              <h3 className={styles.stepTitle}>{st.title}</h3>
              <p className={styles.stepDesc}>{st.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BOOKING */}
      <section id="book" className={styles.section}>
        <div className={styles.bookGrid}>
          <div>
            <div className={styles.eyebrow}>Book online</div>
            <h2 className={styles.bookTitle}>Book Your Repair</h2>
            <BookingForm />
          </div>
          <div className={styles.bookSide}>
            <div className={styles.guaranteeCard}>
              <h3 className={styles.guaranteeTitle}>Every repair includes</h3>
              <div className={styles.guaranteeList}>
                {guarantees.map((g) => (
                  <div key={g} className={styles.guaranteeItem}>
                    <span className={styles.guaranteeCheck}>
                      <CheckIcon width={13} height={13} />
                    </span>
                    {g}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.hoursCard}>
              <div className={styles.hoursHead}>
                <span className={styles.hoursIcon}>
                  <ClockIcon width={20} height={20} />
                </span>
                <div>
                  <div className={styles.hoursLabel}>Business Hours</div>
                  <div className={styles.hoursValue}>Mon – Sat: 9:00 AM – 7:00 PM</div>
                </div>
              </div>
              <div className={styles.hoursNote}>Walk in at 123 Tech Street, Lagos, or book ahead and skip the queue.</div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.footerSpacer} />
    </div>
  );
}
