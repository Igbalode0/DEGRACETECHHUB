import { intentDefs, CONFIDENCE_THRESHOLD } from "./intents";
import { matchProducts, matchRepairs, normalize, tokenize, type KnownProduct } from "./knowledge";
import type { Classification, IntentId, LearnedState } from "./types";

// Weighted keyword/phrase scorer. Deterministic, inspectable, and cheap —
// every answer can be traced back to which words triggered it, and the
// learned token boosts from the feedback loop shift scores over time.
export function classify(message: string, learned: LearnedState, liveProducts?: KnownProduct[]): Classification {
  const text = normalize(message);
  const tokens = tokenize(message);
  const entities = {
    products: matchProducts(message, liveProducts),
    repairs: matchRepairs(message),
  };

  const scores = new Map<IntentId, number>();
  for (const def of intentDefs) {
    let score = 0;
    for (const t of tokens) score += def.keywords[t] ?? 0;
    for (const [phrase, w] of Object.entries(def.phrases)) {
      if (text.includes(phrase)) score += w;
    }
    for (const t of tokens) score += learned.tokenBoosts[t]?.[def.id] ?? 0;
    if (score > 0) scores.set(def.id, score);
  }

  // Entities sharpen ambiguous questions: "iPhone 15 Pro?" alone is a price/
  // stock question, not a repair one; "cracked screen" without a verb is repairs.
  const hasProduct = entities.products.length > 0;
  const hasRepair = entities.repairs.length > 0;
  if (hasProduct) {
    scores.set("pricing", (scores.get("pricing") ?? 0) + 1.5);
    scores.set("stock", (scores.get("stock") ?? 0) + 1);
  }
  if (hasRepair) scores.set("repairs", (scores.get("repairs") ?? 0) + 2);

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    return { intent: "fallback", confidence: 0, entities };
  }

  const [topIntent, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] ?? 0;
  // Absolute strength, discounted when the runner-up is close (ambiguity).
  const strength = Math.min(1, topScore / 5);
  const margin = topScore > 0 ? (topScore - secondScore) / topScore : 0;
  const confidence = Math.round(strength * (0.6 + 0.4 * margin) * 100) / 100;

  if (confidence < CONFIDENCE_THRESHOLD) {
    return { intent: "fallback", confidence, entities, secondBest: topIntent };
  }
  return { intent: topIntent, confidence, entities, secondBest: ranked[1]?.[0] };
}
