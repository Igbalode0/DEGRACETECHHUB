import Link from "next/link";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  RepairIcon,
  SalesIcon,
  SoftwareIcon,
  WhatsAppIcon,
} from "@/components/icons";
import {
  ADDRESS,
  categories,
  contacts,
  reasons,
  reviews,
  services,
  steps,
  WHATSAPP_URL,
} from "@/lib/data";
import { listPublicProducts } from "@/lib/catalog/repo";
import styles from "./page.module.css";

const SERVICE_ICONS = {
  repairs: RepairIcon,
  software: SoftwareIcon,
  sales: SalesIcon,
} as const;

const CONTACT_ICONS = {
  phone: PhoneIcon,
  whatsapp: WhatsAppIcon,
  email: MailIcon,
  address: PinIcon,
  hours: ClockIcon,
} as const;

const reviewsLoop = [...reviews, ...reviews];

export default async function Home() {
  const products = (await listPublicProducts()).slice(0, 8);
  return (
    <div>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlowA} />
        <div className={styles.heroGlowB} />
        <div className={styles.heroGrid}>
          <Reveal>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              <span className={styles.badgeText}>Sales · Repairs · Support</span>
            </div>
            <h1 className={styles.h1}>Your Trusted Gadget Store &amp; Repair Hub</h1>
            <p className={styles.heroText}>
              Whether you need a phone repaired, a new laptop, premium accessories, or expert technical support,
              DE-GRACE TECH HUB delivers quality you can trust.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/shop" className={styles.btnPrimary}>
                Shop Now
                <ArrowRightIcon />
              </Link>
              <Link href="/repairs" className={styles.btnSecondary}>
                Book a Repair
              </Link>
            </div>
          </Reveal>

          <Reveal delayMs={150} className={styles.heroFloat}>
            <div className={`${styles.heroShot} placeholder-fill`}>
              <span className="placeholder-label">[ HERO PRODUCT SHOT ]</span>
            </div>
            <div className={`${styles.floatCard} ${styles.pos1}`}>
              <div className={styles.floatThumb}>
                <span className={styles.floatThumbLabel}>iphone</span>
              </div>
              <span className={styles.floatName}>iPhone</span>
              <div className={styles.floatStatus}>In stock</div>
            </div>
            <div className={`${styles.floatCard} ${styles.pos2}`}>
              <div className={styles.floatThumb}>
                <span className={styles.floatThumbLabel}>macbook</span>
              </div>
              <span className={styles.floatName}>MacBook</span>
              <div className={styles.floatStatus}>New arrival</div>
            </div>
            <div className={`${styles.floatCard} ${styles.pos3}`}>
              <div className={styles.floatThumb}>
                <span className={styles.floatThumbLabel}>watch</span>
              </div>
              <span className={styles.floatName}>Smartwatch</span>
              <div className={styles.floatStatus}>Best seller</div>
            </div>
            <div className={`${styles.floatCard} ${styles.pos4}`}>
              <div className={styles.floatThumb}>
                <span className={styles.floatThumbLabel}>earbuds</span>
              </div>
              <span className={styles.floatName}>Earbuds</span>
              <div className={styles.floatStatus}>Wireless</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* LIMITED STOCK BANNER */}
      <section className={styles.bannerSection}>
        <Reveal className={styles.banner}>
          <div className={styles.bannerLeft}>
            <span className={styles.bannerEmoji}>🔥</span>
            <div>
              <div className={styles.bannerTitle}>Limited Stocks Available</div>
              <div className={styles.bannerSub}>Get the latest gadgets before they&apos;re gone.</div>
            </div>
          </div>
          <Link href="/shop" className={styles.bannerBtn}>
            Shop Collection →
          </Link>
        </Reveal>
      </section>

      {/* STATS */}
      <section className={styles.statsSection}>
        <Reveal className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Counter target={5000} suffix="+" className={styles.statValue} />
            <div className={styles.statLabel}>Devices Repaired</div>
          </div>
          <div className={styles.statCard}>
            <Counter target={12} suffix="+" className={styles.statValue} />
            <div className={styles.statLabel}>Years Experience</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              4.9<span className={styles.star}>★</span>
            </div>
            <div className={styles.statLabel}>Average Rating</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>24/7</div>
            <div className={styles.statLabel}>Customer Support</div>
          </div>
        </Reveal>
      </section>

      {/* SERVICES */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHead}>
          <div className={styles.eyebrow}>What we do</div>
          <h2 className={styles.sectionTitle}>GadgetCare Sales &amp; Repairs</h2>
        </Reveal>
        <div className={styles.servicesGrid}>
          {services.map((svc) => {
            const Icon = SERVICE_ICONS[svc.key];
            return (
              <Reveal key={svc.key} className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Icon />
                </div>
                <h3 className={styles.serviceTitle}>{svc.title}</h3>
                <div className={styles.serviceItems}>
                  {svc.items.map((item) => (
                    <div key={item} className={styles.serviceItem}>
                      <span className={styles.serviceDot} />
                      {item}
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHeadRow}>
          <div>
            <div className={styles.eyebrow}>Browse</div>
            <h2 className={styles.sectionTitle}>Featured Categories</h2>
          </div>
          <Link href="/shop" className={styles.sectionLink}>
            View all →
          </Link>
        </Reveal>
        <div className={styles.catGrid}>
          {categories.map((cat) => (
            <CategoryCard key={cat.name} name={cat.name} emoji={cat.emoji} href="/shop" />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className={styles.section}>
        <div className={styles.whyGrid}>
          <Reveal className={`${styles.whyImage} placeholder-fill`}>
            <div className={styles.whyImageGlow} />
            <span className="placeholder-label" style={{ position: "relative" }}>
              [ TECHNICIAN AT WORK ]
            </span>
          </Reveal>
          <Reveal delayMs={100} className={styles.whyContent}>
            <div className={styles.eyebrow}>Why us</div>
            <h2 className={styles.whyTitle}>Why Customers Trust DE-GRACE TECH HUB</h2>
            <div className={styles.whyList}>
              {reasons.map((r) => (
                <div key={r} className={styles.whyItem}>
                  <span className={styles.whyCheck}>
                    <CheckIcon />
                  </span>
                  <span className={styles.whyItemText}>{r}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHeadRow}>
          <div>
            <div className={styles.eyebrow}>Best sellers</div>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
          </div>
          <Link href="/shop" className={styles.sectionLink}>
            Shop all products →
          </Link>
        </Reveal>
        <div className={styles.productsGrid}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* REPAIR PROCESS */}
      <section className={styles.section}>
        <Reveal as="div" className={styles.sectionHead}>
          <div className={styles.eyebrow}>Simple &amp; transparent</div>
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

      {/* REVIEWS */}
      <section className={styles.reviewsSection}>
        <Reveal as="div" className={styles.reviewsHead}>
          <div className={styles.eyebrow}>Loved by customers</div>
          <h2 className={styles.sectionTitle}>Customer Reviews</h2>
        </Reveal>
        <div className={styles.reviewsMask}>
          <div className={styles.reviewsTrack}>
            {reviewsLoop.map((rv, i) => (
              <div key={`${rv.name}-${i}`} className={styles.reviewCard}>
                <div className={styles.reviewStars}>★★★★★</div>
                <p className={styles.reviewText}>&quot;{rv.text}&quot;</p>
                <div className={styles.reviewFooter}>
                  <div className={styles.reviewAvatar}>{rv.initial}</div>
                  <div>
                    <div className={styles.reviewName}>{rv.name}</div>
                    <div className={styles.reviewRole}>{rv.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className={`${styles.contactSection} ${styles.footerSpacer}`}>
        <Reveal as="div" className={styles.sectionHead}>
          <div className={styles.eyebrow}>Visit or reach out</div>
          <h2 className={styles.sectionTitle}>Get in Touch</h2>
        </Reveal>
        <Reveal className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            {contacts.map((c) => {
              const Icon = CONTACT_ICONS[c.key];
              return (
                <div key={c.key} className={styles.contactRow}>
                  <span className={styles.contactIcon}>
                    <Icon width={22} height={22} />
                  </span>
                  <div className={styles.contactText}>
                    <div className={styles.contactLabel}>{c.label}</div>
                    <div className={styles.contactValue}>{c.value}</div>
                  </div>
                </div>
              );
            })}
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.contactWhatsapp}>
              <WhatsAppIcon />
              Chat on WhatsApp
            </a>
          </div>
          <div className={`${styles.mapBox} placeholder-fill`}>
            <div className={styles.mapGlow} />
            <div className={styles.mapInner}>
              <PinIcon width={34} height={34} stroke="#60a5fa" strokeWidth={1.6} style={{ marginBottom: 10 }} />
              <div className="placeholder-label">[ EMBEDDED GOOGLE MAP ]</div>
              <div className={styles.mapAddr}>{ADDRESS}</div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
