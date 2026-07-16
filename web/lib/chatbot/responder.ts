import { naira } from "@/lib/format";
import {
  ADDRESS,
  PHONE_DISPLAY,
  categorySummary,
  guarantees,
  hours,
  productLine,
  repairPriceList,
} from "./knowledge";
import type { BotReply, Classification, LearnedState } from "./types";

type Ctx = { c: Classification; consecutiveMisses: number };
type Variant = { id: string; render: (ctx: Ctx) => string };
type Handler = { variants: Variant[]; suggestions: string[]; escalate?: (ctx: Ctx) => boolean };

const DEFAULT_SUGGESTIONS = ["Repair price list", "Do you deliver?", "Book a repair", "Opening hours"];

// Variants are alternative phrasings of the same answer. The feedback loop
// scores each one ("intent:variantId" in LearnedState.variantScores) and
// pick() serves the best-rated, so downvoted wording phases itself out.
const handlers: Record<Classification["intent"], Handler> = {
  greeting: {
    variants: [
      {
        id: "warm",
        render: () =>
          "Hi! Welcome to DE-GRACE TECH HUB 👋 I can help with product prices, what's in stock, repairs and bookings. What do you need?",
      },
      {
        id: "brief",
        render: () => "Hello! Ask me about prices, stock, or repairs — or say “talk to a human” anytime.",
      },
    ],
    suggestions: ["Repair price list", "What do you sell?", "Opening hours", "Talk to a human"],
  },

  pricing: {
    variants: [
      {
        id: "detail",
        render: ({ c }) => {
          if (c.entities.products.length > 0) {
            const lines = c.entities.products.map((p) => `• ${productLine(p)}`).join("\n");
            return `Here's what I found:\n${lines}\n\nPrices include our quality check. Want me to check availability or add anything else?`;
          }
          if (c.entities.repairs.length > 0) {
            const lines = c.entities.repairs
              .map((r) => (r.price ? `• ${r.label}: ${r.price}` : `• ${r.label}: free diagnosis first, then an upfront quote`))
              .join("\n");
            return `Repair pricing:\n${lines}\n\nDiagnosis is always free — the final quote depends on your device model.`;
          }
          return `Happy to help with pricing! Our repair rates:\n${repairPriceList()}\n\nFor a product price, just tell me the device name (e.g. “iPhone 15 Pro”).`;
        },
      },
      {
        id: "compact",
        render: ({ c }) => {
          if (c.entities.products.length > 0) {
            return c.entities.products.map((p) => productLine(p)).join("\n") + "\n\nAnything else you'd like to check?";
          }
          if (c.entities.repairs.length > 0) {
            const r = c.entities.repairs[0];
            return r.price
              ? `${r.label} is ${r.price} (free diagnosis included). Exact quote can vary by device model.`
              : `For ${r.label} we do a free diagnosis first and give you an upfront quote before any work starts.`;
          }
          return `Our repair price list:\n${repairPriceList()}\n\nName any device for its price.`;
        },
      },
    ],
    suggestions: ["Is it in stock?", "Book a repair", "Do you deliver?"],
  },

  stock: {
    variants: [
      {
        id: "detail",
        render: ({ c }) => {
          if (c.entities.products.length > 0) {
            const lines = c.entities.products
              .map((p) => `• ${productLine(p)} — ${p.soldOut ? "sold out right now ❌" : "in stock ✅"}`)
              .join("\n");
            const anyAvailable = c.entities.products.some((p) => !p.soldOut);
            return anyAvailable
              ? `Here's the latest:\n${lines}\n\nYou can add it to your cart on the Shop page, or I can connect you to the team to reserve one.`
              : `Here's the latest:\n${lines}\n\nWant me to connect you with the team? They can tell you when it's back or suggest an alternative.`;
          }
          return `We stock: ${categorySummary()}. Which device are you looking for? I'll check it for you.`;
        },
      },
      {
        id: "compact",
        render: ({ c }) => {
          const p = c.entities.products[0];
          if (!p) return `Tell me the device name and I'll check stock. We carry ${categorySummary()}.`;
          return p.soldOut
            ? `${p.name} is sold out at the moment. The team can tell you when it's back — want me to connect you?`
            : `${p.name} is in stock — ${naira(p.price)}. Grab it on the Shop page or ask me to reserve it.`;
        },
      },
    ],
    suggestions: ["How much is it?", "Do you deliver?", "Talk to a human"],
  },

  repairs: {
    variants: [
      {
        id: "detail",
        render: ({ c }) => {
          if (c.entities.repairs.length > 0) {
            const r = c.entities.repairs[0];
            const price = r.price ? `That's typically ${r.price}` : "We'll diagnose it free and quote you upfront";
            return `Sorry to hear that! We handle ${r.label.toLowerCase()} regularly. ${price}, with genuine parts and a warranty on the work. Most repairs are done same-day — want to book it in?`;
          }
          return `We fix screens, batteries, charging ports, water damage, cameras and speakers, plus software work (flashing, unlocking, virus removal, data recovery). What's wrong with your device?`;
        },
      },
      {
        id: "compact",
        render: ({ c }) =>
          c.entities.repairs.length > 0
            ? `We can fix that. ${c.entities.repairs[0].label}${c.entities.repairs[0].price ? ` is ${c.entities.repairs[0].price}` : " — free diagnosis, upfront quote"}, warranty included. Book online or walk in.`
            : `Screens, batteries, charging ports, water damage, cameras, software — we fix it all. What happened to your device?`,
      },
    ],
    suggestions: ["Book a repair", "Repair price list", "How long does it take?"],
  },

  booking: {
    variants: [
      {
        id: "detail",
        render: () =>
          `Booking is easy: use the form on our Repairs page, or just walk in — ${ADDRESS}, ${hours}. Diagnosis is free and most repairs are done same-day. What device is it?`,
      },
      {
        id: "compact",
        render: () => `Book via the Repairs page form, or walk in (${hours}). Free diagnosis, most fixes done same-day.`,
      },
    ],
    suggestions: ["Repair price list", "Where are you located?", "Talk to a human"],
  },

  repair_status: {
    variants: [
      {
        id: "handoff",
        render: () =>
          `I can't see live repair records from here, but the team can check instantly. Tap “Talk to a human” below or WhatsApp us on ${PHONE_DISPLAY} with your name and I'll make sure it gets looked at.`,
      },
    ],
    suggestions: ["Talk to a human", "Opening hours"],
    escalate: () => true,
  },

  warranty: {
    variants: [
      {
        id: "detail",
        render: () =>
          `Every repair is backed by our warranty and we use genuine quality parts — our promise: ${guarantees.join(", ").toLowerCase()}. If anything we fixed acts up again, bring it back and we'll make it right at no charge.`,
      },
      {
        id: "compact",
        render: () => `All repairs carry a warranty and we only use genuine parts. If the fault comes back, the follow-up is on us.`,
      },
    ],
    suggestions: ["Book a repair", "Repair price list", "Talk to a human"],
  },

  hours_location: {
    variants: [
      {
        id: "detail",
        render: () => `We're at ${ADDRESS} 📍 Open ${hours}. Walk-ins welcome — diagnosis is free. Need directions or want to call ahead? ${PHONE_DISPLAY}.`,
      },
      {
        id: "compact",
        render: () => `${ADDRESS} · ${hours} · ${PHONE_DISPLAY}`,
      },
    ],
    suggestions: ["Book a repair", "What do you sell?"],
  },

  payment_delivery: {
    variants: [
      {
        id: "detail",
        render: () =>
          `We accept cash, bank transfer and card (POS) in-store. For delivery, message the team on WhatsApp (${PHONE_DISPLAY}) with your location and they'll confirm options and cost before you pay anything.`,
      },
    ],
    suggestions: ["Talk to a human", "What do you sell?", "Opening hours"],
  },

  human: {
    variants: [
      {
        id: "handoff",
        render: () => `Of course — let me connect you. Share your name and phone number below and the team will reach out, or jump straight to WhatsApp.`,
      },
    ],
    suggestions: [],
    escalate: () => true,
  },

  thanks: {
    variants: [
      { id: "warm", render: () => "You're welcome! Anything else I can help with? 😊" },
      { id: "brief", render: () => "Anytime! I'm here if you need prices, stock or repairs." },
    ],
    suggestions: DEFAULT_SUGGESTIONS,
  },

  goodbye: {
    variants: [
      { id: "warm", render: () => `Thanks for stopping by DE-GRACE TECH HUB — see you soon! We're open ${hours}.` },
    ],
    suggestions: [],
  },

  fallback: {
    variants: [
      {
        id: "clarify",
        render: ({ c }) => {
          const hint =
            c.secondBest && c.secondBest !== "fallback"
              ? `\n\nWere you asking about ${SECOND_BEST_LABEL[c.secondBest] ?? c.secondBest}?`
              : "";
          return `I'm not sure I got that. I'm best with prices, stock, repairs, bookings and store info.${hint}`;
        },
      },
      {
        id: "menu",
        render: () => `Hmm, I didn't catch that. Try one of these, or rephrase in a few words:`,
      },
    ],
    suggestions: [...DEFAULT_SUGGESTIONS, "Talk to a human"],
    // Two misses in a row = stop wasting the customer's time, offer a human.
    escalate: ({ consecutiveMisses }) => consecutiveMisses >= 2,
  },
};

const SECOND_BEST_LABEL: Partial<Record<Classification["intent"], string>> = {
  pricing: "a price",
  stock: "whether something is in stock",
  repairs: "a repair",
  booking: "booking a repair",
  warranty: "our warranty",
  hours_location: "our hours or location",
  payment_delivery: "payment or delivery",
};

function pick(intent: Classification["intent"], variants: Variant[], learned: LearnedState): Variant {
  if (variants.length === 1) return variants[0];
  // Mostly exploit the best-rated variant, occasionally explore others so
  // fresh phrasings can still earn feedback.
  if (Math.random() < 0.15) return variants[Math.floor(Math.random() * variants.length)];
  return [...variants].sort(
    (a, b) => (learned.variantScores[`${intent}:${b.id}`] ?? 0) - (learned.variantScores[`${intent}:${a.id}`] ?? 0),
  )[0];
}

export function respond(c: Classification, consecutiveMisses: number, learned: LearnedState): BotReply {
  const handler = handlers[c.intent];
  const ctx: Ctx = { c, consecutiveMisses };
  const variant = pick(c.intent, handler.variants, learned);
  const escalate = handler.escalate?.(ctx) ?? false;
  let text = variant.render(ctx);
  if (escalate && c.intent === "fallback") {
    text += `\n\nWould you like me to connect you with a real person instead?`;
  }
  return { text, suggestions: handler.suggestions, escalate, variantId: variant.id };
}
