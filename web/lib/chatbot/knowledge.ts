import {
  shopProducts,
  repairPrices,
  repairServices,
  contacts,
  guarantees,
  WHATSAPP_URL,
  PHONE_DISPLAY,
  ADDRESS,
} from "@/lib/data";
import { naira } from "@/lib/format";

// The bot's knowledge is derived from lib/data.ts at module load, so every
// product, service, or price added there is immediately answerable — no
// separate training data to keep in sync.

export const hours = contacts.find((c) => c.key === "hours")?.value ?? "Mon – Sat: 9:00 AM – 7:00 PM";

export { WHATSAPP_URL, PHONE_DISPLAY, ADDRESS, guarantees };

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "do", "does", "did", "i", "my", "me", "you", "your",
  "it", "its", "of", "for", "to", "in", "on", "at", "and", "or", "can", "could", "would",
  "will", "with", "have", "has", "had", "be", "been", "this", "that", "there", "what",
  "whats", "please", "pls",
]);

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
}

// ---- Product index -------------------------------------------------------

export type KnownProduct = {
  id: string;
  name: string;
  price: number;
  category?: string;
  soldOut?: boolean;
};

type IndexedProduct = KnownProduct & {
  tokens: string[];
  /** e.g. "iphone15pro" so "iphone15" style messages still match. */
  compact: string;
};

const GENERIC_TOKENS = new Set(["apple", "samsung", "google", "phone", "case", "watch", "pro", "air", "premium", "wireles"]);

function indexProducts(products: KnownProduct[]): IndexedProduct[] {
  return products.map((p) => ({
    ...p,
    tokens: tokenize(p.name),
    compact: normalize(p.name).replace(/\s/g, ""),
  }));
}

// Static fallback; the chat route passes the live admin-managed catalog so
// stock answers reflect reality (sold-out toggles, new products) in real time.
const staticIndex = indexProducts(shopProducts);

export function matchProducts(message: string, live?: KnownProduct[]): (KnownProduct & { score: number })[] {
  const index = live ? indexProducts(live) : staticIndex;
  const msgTokens = new Set(tokenize(message));
  const compactMsg = normalize(message).replace(/\s/g, "");
  const hits: (KnownProduct & { score: number })[] = [];

  for (const p of index) {
    const matched = p.tokens.filter((t) => msgTokens.has(t));
    const distinctive = matched.some((t) => !GENERIC_TOKENS.has(t));
    let score = p.tokens.length ? matched.length / p.tokens.length : 0;
    if (compactMsg.includes(p.compact)) score = 1;
    // "iphone15" / "macbookair" style tokens with the spaces squashed out
    for (const t of msgTokens) {
      if (t.length >= 6 && p.compact.includes(t) && score < 0.7) score = 0.7;
    }
    if (score >= 0.5 && (distinctive || score >= 0.7))
      hits.push({ id: p.id, name: p.name, price: p.price, category: p.category, soldOut: p.soldOut, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 3);
}

// ---- Repair service index ------------------------------------------------

const priceByLabel = new Map(repairPrices.map((r) => [normalize(r.label), r.price]));

const repairIndex = [
  ...repairPrices.map((r) => r.label),
  ...repairServices.flatMap((s) => s.items),
]
  .filter((label, i, all) => all.findIndex((l) => normalize(l) === normalize(label)) === i)
  .map((label) => ({ label, tokens: tokenize(label) }));

// Common phrasings that don't literally contain the service name.
const REPAIR_ALIASES: Record<string, string> = {
  "cracked screen": "Screen Replacement",
  "broken screen": "Screen Replacement",
  "screen fix": "Screen Replacement",
  "battery drain": "Battery Replacement",
  "not charging": "Charging Port Repair",
  "wont charge": "Charging Port Repair",
  "fell in water": "Water Damage Treatment",
  "water dropped": "Water Damage Treatment",
  "forgot password": "Unlocking",
  "icloud lock": "Unlocking",
  "lost file": "Data Recovery",
  "deleted file": "Data Recovery",
  "slow phone": "Virus Removal",
};

export function matchRepairs(message: string): { label: string; price?: string; score: number }[] {
  const msg = normalize(message);
  const msgTokens = new Set(tokenize(message));
  const hits = new Map<string, { label: string; price?: string; score: number }>();

  for (const [alias, label] of Object.entries(REPAIR_ALIASES)) {
    if (msg.includes(alias)) hits.set(label, { label, price: priceByLabel.get(normalize(label)), score: 1 });
  }
  for (const r of repairIndex) {
    const matched = r.tokens.filter((t) => msgTokens.has(t));
    const score = r.tokens.length ? matched.length / r.tokens.length : 0;
    if (score >= 0.5 && !hits.has(r.label)) {
      hits.set(r.label, { label: r.label, price: priceByLabel.get(normalize(r.label)), score });
    }
  }
  return [...hits.values()].sort((a, b) => b.score - a.score).slice(0, 3);
}

// ---- Formatting helpers used by the responder ----------------------------

export function productLine(p: { name: string; price: number }): string {
  return `${p.name} — ${naira(p.price)}`;
}

export function repairPriceList(): string {
  return repairPrices.map((r) => `• ${r.label}: ${r.price}`).join("\n");
}

export function categorySummary(): string {
  const byCat = new Map<string, number>();
  for (const p of shopProducts) byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
  return [...byCat.entries()].map(([cat, n]) => `${cat} (${n})`).join(", ");
}
