"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductArt, { artKindFor } from "@/components/ProductArt";
import { CartIcon, CheckIcon, CloseIcon, WhatsAppIcon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { naira } from "@/lib/format";
import { WHATSAPP_URL } from "@/lib/data";
import type { PublicProduct } from "@/lib/catalog/types";
import styles from "./QuickView.module.css";

const DRAG_DISMISS_PX = 120;
const WISHLIST_KEY = "dg_wishlist";

// Colour names map to swatch fills; anything unrecognised falls back to a
// neutral chip so an admin can type any colour without breaking the UI.
const SWATCH_COLORS: Record<string, string> = {
  black: "#1c1c1e",
  space: "#3a3a3c",
  graphite: "#4a4a4d",
  grey: "#8e8e93",
  gray: "#8e8e93",
  silver: "#e3e4e6",
  white: "#f5f5f7",
  gold: "#e8c9a0",
  rose: "#e8b4b8",
  blue: "#3b82f6",
  navy: "#1e3a8a",
  green: "#4ade80",
  red: "#ef4444",
  purple: "#a78bfa",
  orange: "#fb923c",
  yellow: "#facc15",
  pink: "#f9a8d4",
  titanium: "#8a8a8f",
};

function swatchFill(name: string): string {
  const key = Object.keys(SWATCH_COLORS).find((k) => name.toLowerCase().includes(k));
  return key ? SWATCH_COLORS[key] : "#6b7280";
}

const DELIVERY = ["Nationwide delivery", "Same-day delivery where available", "Pickup available in store"];

// Payment routes are business policy, not per-product claims. Anything that
// needs the team to confirm is labelled so, rather than promised outright.
const PAYMENT = [
  { icon: "💳", title: "Pay in full", note: "Cash, bank transfer or card in store" },
  { icon: "🏪", title: "Pay on pickup", note: "Reserve now, settle when you collect" },
  { icon: "💰", title: "Installment plans", note: "Available on request — ask the team" },
  { icon: "🔄", title: "Trade-in", note: "Available on request — ask the team" },
];

export default function QuickView({
  product,
  onClose,
  onSwitch,
}: {
  product: PublicProduct;
  onClose: () => void;
  onSwitch: (p: PublicProduct) => void;
}) {
  const { addToCart } = useCart();
  const dialogRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const [colorIndex, setColorIndex] = useState(0);
  const [storage, setStorage] = useState<string | null>(product.storageOptions?.[0] ?? null);
  const [slide, setSlide] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);
  // Lazy init is safe: the dialog only ever mounts client-side, on user action.
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      return (JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[]).includes(product.id);
    } catch {
      return false;
    }
  });
  const [related, setRelated] = useState<PublicProduct[]>([]);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const images = useMemo(
    () => [product.imageUrl, ...(product.images ?? [])].filter((s): s is string => Boolean(s)),
    [product],
  );
  const artKind = artKindFor(product.name, product.category);
  const monthly = Math.round(product.price / 12 / 1000) * 1000;

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Escape to close + focus trap so keyboard users stay inside the dialog.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // "Customers also viewed" — same category, live from the catalog feed.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((all: PublicProduct[]) => {
        if (cancelled) return;
        const sameCategory = all.filter((p) => p.id !== product.id && p.category === product.category);
        const others = all.filter((p) => p.id !== product.id && p.category !== product.category);
        setRelated([...sameCategory, ...others].slice(0, 8));
      })
      .catch(() => setRelated([]));
    return () => {
      cancelled = true;
    };
  }, [product]);

  const selectColor = (i: number) => {
    setColorIndex(i);
    // When per-colour shots exist, the gallery follows the selection.
    if (images.length > 1) {
      const target = Math.min(i, images.length - 1);
      setSlide(target);
      const el = galleryRef.current;
      el?.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
    }
  };

  const goToSlide = (i: number) => {
    const el = galleryRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setSlide(i);
  };

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el || el.clientWidth === 0) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  const variantSuffix = [product.colors[colorIndex], storage].filter(Boolean).join(" · ");

  const buyNow = () => {
    const lines = [
      "Hello DE-GRACE TECH HUB!",
      `I'd like to buy: ${product.name}${variantSuffix ? ` (${variantSuffix})` : ""}`,
      `Price: ${naira(product.price)}`,
    ];
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  };

  const toggleWishlist = () => {
    try {
      const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]") as string[];
      const next = list.includes(product.id) ? list.filter((id) => id !== product.id) : [...list, product.id];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      setWishlisted(next.includes(product.id));
    } catch {
      // storage unavailable — wishlist just doesn't persist
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/shop`;
    const data = { title: product.name, text: `${product.name} — ${naira(product.price)} at DE-GRACE TECH HUB`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard.writeText(`${data.text} ${url}`);
    } catch {
      // user dismissed the share sheet
    }
  };

  /** Hands the product over to the site assistant, which already knows the catalog. */
  const askAssistant = () => {
    onClose();
    window.dispatchEvent(
      new CustomEvent("dg:ask", { detail: { message: `Tell me about the ${product.name}` } }),
    );
  };

  // ---- mobile bottom-sheet drag to dismiss ----
  const dragStart = useRef<number | null>(null);
  const isSheet = useCallback(() => window.matchMedia("(max-width: 760px)").matches, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isSheet() || e.pointerType === "mouse") return;
    dragStart.current = e.clientY;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const dy = e.clientY - dragStart.current;
    if (dy > 0) setDragY(dy);
  };
  const endDrag = () => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > DRAG_DISMISS_PX) onClose();
    else setDragY(0);
  };

  const hasSpecs = (product.specs?.length ?? 0) > 0;
  const longDescription = product.description.length > 180;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
        tabIndex={-1}
        className={styles.dialog}
        style={dragY ? { transform: `translateY(${dragY}px)`, transition: dragging ? "none" : undefined } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* header — sticky */}
        <header
          className={styles.header}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className={styles.grabber} aria-hidden="true" />
          <div className={styles.headerRow}>
            <div className={styles.headerText}>
              <span className={styles.headerTag}>{product.tag}</span>
              <h2 id="quickview-title" className={styles.headerTitle}>
                {product.name}
              </h2>
            </div>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close quick view">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {/* gallery */}
          <section className={styles.gallerySection} aria-label={`${product.name} images`}>
            <div className={styles.gallery} ref={galleryRef} onScroll={onGalleryScroll}>
              {images.length > 0 ? (
                images.map((src, i) => (
                  <div className={styles.slide} key={src + i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`${product.name} — view ${i + 1}`}
                      className={`${styles.shot} ${zoomed ? styles.shotZoomed : ""}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      onClick={() => setZoomed((z) => !z)}
                    />
                  </div>
                ))
              ) : (
                <div className={styles.slide}>
                  <div className={styles.artStage} key={colorIndex}>
                    <ProductArt kind={artKind} size={148} />
                  </div>
                </div>
              )}
            </div>

            {images.length > 0 && (
              <button type="button" className={styles.zoomHint} onClick={() => setZoomed((z) => !z)}>
                {zoomed ? "Tap to reset" : "Tap image to zoom"}
              </button>
            )}

            {images.length > 1 && (
              <div className={styles.dots} role="tablist" aria-label="Gallery pages">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    role="tab"
                    aria-selected={i === slide}
                    aria-label={`View image ${i + 1}`}
                    className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`}
                    onClick={() => goToSlide(i)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* buy panel */}
          <section className={styles.panel}>
            {product.colors.length > 0 && (
              <div className={styles.optionBlock}>
                <div className={styles.optionLabel}>
                  Colour — <span className={styles.optionValue}>{product.colors[colorIndex]}</span>
                </div>
                <div className={styles.swatches} role="radiogroup" aria-label="Colour">
                  {product.colors.map((c, i) => (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={i === colorIndex}
                      aria-label={c}
                      title={c}
                      className={`${styles.swatch} ${i === colorIndex ? styles.swatchActive : ""}`}
                      style={{ ["--swatch" as string]: swatchFill(c) }}
                      onClick={() => selectColor(i)}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.storageOptions && product.storageOptions.length > 0 && (
              <div className={styles.optionBlock}>
                <div className={styles.optionLabel}>Storage</div>
                <div className={styles.chips} role="radiogroup" aria-label="Storage">
                  {product.storageOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={s === storage}
                      className={`${styles.chip} ${s === storage ? styles.chipActive : ""}`}
                      onClick={() => setStorage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.priceBlock}>
              <div className={styles.priceLabel}>Starting from</div>
              <div className={styles.price}>{naira(product.price)}</div>
              <div className={styles.finance}>
                ≈ {naira(monthly)}/month over 12 months — installments on request
              </div>
              <div className={product.soldOut ? styles.soldOut : styles.inStock}>
                {product.soldOut ? (
                  "Currently sold out — ask us when it's back"
                ) : (
                  <>
                    <CheckIcon /> In stock, ready to collect or deliver
                  </>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.buyBtn} onClick={buyNow} disabled={product.soldOut}>
                <WhatsAppIcon />
                Buy Now
              </button>
              <button
                type="button"
                className={styles.cartBtn}
                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                disabled={product.soldOut}
              >
                <CartIcon width={16} height={16} />
                Add to Cart
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${wishlisted ? styles.iconBtnOn : ""}`}
                onClick={toggleWishlist}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                title={wishlisted ? "Saved" : "Save to wishlist"}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 20s-7-4.6-7-9.6A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.4c0 5-7 9.6-7 9.6z" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={askAssistant}
                aria-label={`Ask our assistant about the ${product.name}`}
                title="Ask about this product"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                </svg>
              </button>
              <button type="button" className={styles.iconBtn} onClick={share} aria-label="Share this product" title="Share">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15V4m0 0L8 8m4-4 4 4" />
                  <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
                </svg>
              </button>
            </div>
          </section>

          {/* details */}
          <div className={styles.details}>
            {product.features && product.features.length > 0 && (
              <section className={styles.block} aria-label="Key features">
                <h3 className={styles.blockTitle}>Key features</h3>
                <ul className={styles.featureGrid}>
                  {product.features.map((f, i) => (
                    <li key={f.label} className={styles.featureCard} style={{ animationDelay: `${i * 60}ms` }}>
                      <span className={styles.featureIcon} aria-hidden="true">
                        {f.icon}
                      </span>
                      <span className={styles.featureLabel}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {product.description && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>About this product</h3>
                <p className={`${styles.description} ${!descOpen && longDescription ? styles.descriptionClamped : ""}`}>
                  {product.description}
                </p>
                {longDescription && (
                  <button type="button" className={styles.readMore} onClick={() => setDescOpen((o) => !o)}>
                    {descOpen ? "Read less" : "Read more"}
                  </button>
                )}
              </section>
            )}

            <section className={styles.block}>
              <button
                type="button"
                className={styles.accordionHead}
                aria-expanded={specsOpen}
                onClick={() => setSpecsOpen((o) => !o)}
              >
                <span className={styles.blockTitle}>Technical specifications</span>
                <span className={`${styles.chevron} ${specsOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
                  ⌄
                </span>
              </button>
              {specsOpen &&
                (hasSpecs ? (
                  <dl className={styles.specList}>
                    {product.specs!.map((s) => (
                      <div className={styles.specRow} key={s.label}>
                        <dt className={styles.specLabel}>{s.label}</dt>
                        <dd className={styles.specValue}>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className={styles.specEmpty}>
                    Full specifications for this unit are confirmed by our team — models and configurations vary by
                    stock.{" "}
                    <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={styles.inlineLink}>
                      Ask us on WhatsApp →
                    </a>
                  </p>
                ))}
            </section>

            {product.included && product.included.length > 0 && (
              <section className={styles.block} aria-label="What's included">
                <h3 className={styles.blockTitle}>What&apos;s in the box</h3>
                <ul className={styles.includedList}>
                  {product.included.map((item) => (
                    <li key={item} className={styles.includedItem}>
                      <span className={styles.includedTick} aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.block} aria-label="Delivery information">
              <h3 className={styles.blockTitle}>Delivery</h3>
              <ul className={styles.deliveryList}>
                {DELIVERY.map((d) => (
                  <li key={d} className={styles.deliveryItem}>
                    <span className={styles.includedTick} aria-hidden="true">
                      <CheckIcon />
                    </span>
                    {d}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block} aria-label="Payment options">
              <h3 className={styles.blockTitle}>Payment options</h3>
              <ul className={styles.payGrid}>
                {PAYMENT.map((p) => (
                  <li key={p.title} className={styles.payCard}>
                    <span className={styles.payIcon} aria-hidden="true">
                      {p.icon}
                    </span>
                    <span className={styles.payTitle}>{p.title}</span>
                    <span className={styles.payNote}>{p.note}</span>
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 && (
              <section className={styles.block} aria-label="Customers also viewed">
                <h3 className={styles.blockTitle}>Customers also viewed</h3>
                <ul className={styles.relatedRail}>
                  {related.map((r) => (
                    <li key={r.id} className={styles.relatedItem}>
                      <button type="button" className={styles.relatedCard} onClick={() => onSwitch(r)}>
                        <span className={styles.relatedShot}>
                          {r.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.imageUrl} alt="" className={styles.relatedImg} loading="lazy" />
                          ) : (
                            <ProductArt kind={artKindFor(r.name, r.category)} size={54} />
                          )}
                        </span>
                        <span className={styles.relatedName}>{r.name}</span>
                        <span className={styles.relatedPrice}>{naira(r.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* sticky mobile action bar */}
        <div className={styles.stickyBar}>
          <div className={styles.stickyPrice}>
            <span className={styles.stickyLabel}>Starting from</span>
            <span className={styles.stickyValue}>{naira(product.price)}</span>
          </div>
          <button type="button" className={styles.buyBtn} onClick={buyNow} disabled={product.soldOut}>
            <WhatsAppIcon />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
