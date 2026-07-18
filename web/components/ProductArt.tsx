// Minimal line-art device illustrations used wherever a product has no photo
// yet — hero cards and catalog fallbacks. Drawn to feel deliberate (Nothing /
// Apple-style schematics) rather than "image missing".

export type ArtKind =
  | "phone"
  | "laptop"
  | "tablet"
  | "watch"
  | "earbuds"
  | "charger"
  | "powerbank"
  | "case"
  | "generic";

export function artKindFor(name: string, category?: string): ArtKind {
  const n = name.toLowerCase();
  if (n.includes("case")) return "case";
  if (n.includes("charger")) return "charger";
  if (n.includes("power bank") || n.includes("powerbank")) return "powerbank";
  if (n.includes("airpods") || n.includes("earbud") || n.includes("buds")) return "earbuds";
  if (n.includes("watch")) return "watch";
  switch (category) {
    case "Smartphones":
      return "phone";
    case "Laptops":
      return "laptop";
    case "Tablets":
      return "tablet";
    case "Smartwatches":
      return "watch";
    case "Accessories":
      return "generic";
    default:
      return "phone";
  }
}

/** Deterministic card tint so each artless product looks intentional, not broken. */
export function tintFor(id: string): string {
  const hues = [
    "rgba(59, 130, 246, 0.14)", // blue
    "rgba(99, 102, 241, 0.13)", // indigo
    "rgba(56, 189, 248, 0.12)", // sky
    "rgba(45, 212, 191, 0.11)", // teal
  ];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `radial-gradient(120% 100% at 50% 0%, ${hues[h % hues.length]}, rgba(255, 255, 255, 0.02) 70%)`;
}

const STROKE = "rgba(245, 246, 250, 0.82)";
const ACCENT = "#60a5fa";

const SHAPES: Record<ArtKind, React.ReactNode> = {
  phone: (
    <>
      <rect x="22" y="9" width="20" height="46" rx="5.5" />
      <path d="M28 13.5 h8" stroke={ACCENT} />
      <path d="M29 50.5 h6" />
    </>
  ),
  laptop: (
    <>
      <rect x="15" y="14" width="34" height="24" rx="3" />
      <path d="M11 44 h42" strokeLinecap="round" />
      <path d="M27 41 h10" stroke={ACCENT} />
    </>
  ),
  tablet: (
    <>
      <rect x="18" y="9" width="28" height="46" rx="5" />
      <circle cx="32" cy="50" r="1.6" stroke={ACCENT} />
    </>
  ),
  watch: (
    <>
      <rect x="22" y="19" width="20" height="26" rx="7" />
      <path d="M26 19 v-7 h12 v7" />
      <path d="M26 45 v7 h12 v-7" />
      <path d="M32 27 v6 h4" stroke={ACCENT} strokeLinecap="round" />
    </>
  ),
  earbuds: (
    <>
      <path d="M24 22 a6 6 0 1 1 0.01 0 z" />
      <path d="M22 27 v14 a3 3 0 0 0 6 0 v-8" />
      <path d="M40 22 a6 6 0 1 1 0.01 0 z" stroke={ACCENT} />
      <path d="M38 27 v14 a3 3 0 0 0 6 0 v-8" stroke={ACCENT} />
    </>
  ),
  charger: (
    <>
      <rect x="20" y="24" width="24" height="24" rx="7" />
      <path d="M27 24 v-8 M37 24 v-8" strokeLinecap="round" />
      <path d="M33 30 l-4 7 h6 l-4 7" stroke={ACCENT} strokeLinejoin="round" />
    </>
  ),
  powerbank: (
    <>
      <rect x="14" y="20" width="36" height="22" rx="8" />
      <path d="M30 25 l-4 6 h6 l-4 6" stroke={ACCENT} strokeLinejoin="round" />
      <path d="M40 29 h4 M40 33 h4" strokeLinecap="round" />
    </>
  ),
  case: (
    <>
      <rect x="22" y="9" width="20" height="46" rx="6" />
      <rect x="26" y="13" width="9" height="9" rx="3" stroke={ACCENT} />
    </>
  ),
  generic: (
    <>
      <rect x="16" y="16" width="32" height="32" rx="9" />
      <circle cx="32" cy="32" r="6" stroke={ACCENT} />
    </>
  ),
};

export default function ProductArt({ kind, size = 56 }: { kind: ArtKind; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke={STROKE}
      strokeWidth="2"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 14px rgba(59, 130, 246, 0.28))" }}
    >
      {SHAPES[kind]}
    </svg>
  );
}
