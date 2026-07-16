import type { IntentId } from "./types";

export type IntentDef = {
  id: Exclude<IntentId, "fallback">;
  /** Single tokens with weights. */
  keywords: Record<string, number>;
  /** Multi-word phrases (matched on normalized text) — stronger signal. */
  phrases: Record<string, number>;
};

// Weights are additive; classify() turns the winning sum into a confidence.
// New intents only need an entry here plus a handler in responder.ts.
export const intentDefs: IntentDef[] = [
  {
    id: "greeting",
    keywords: { hello: 2, hi: 2, hey: 2, morning: 1.5, afternoon: 1.5, evening: 1.5, sup: 1.5, yo: 1.5 },
    phrases: { "good morning": 3, "good afternoon": 3, "good evening": 3, "how far": 2.5 },
  },
  {
    id: "pricing",
    keywords: { price: 3, cost: 3, much: 2, amount: 2, charge: 2, fee: 2, cheap: 1.5, expensive: 1.5, budget: 1.5, rate: 1.5, quote: 2 },
    phrases: { "how much": 4, "price of": 4, "price list": 4, "cost of": 4, "going for": 3 },
  },
  {
    id: "stock",
    keywords: { stock: 3, available: 3, availability: 3, sell: 2, have: 1, get: 1, buy: 2, order: 2, instock: 3 },
    phrases: { "in stock": 5, "do you have": 4, "do you sell": 4, "is it available": 4, "can i get": 3, "can i buy": 3 },
  },
  {
    id: "repairs",
    keywords: { repair: 3, fix: 3, broken: 2.5, crack: 2.5, cracked: 2.5, damage: 2, damaged: 2, screen: 1.5, battery: 1.5, charging: 1.5, water: 1, flashing: 2, unlock: 2, unlocking: 2, virus: 2, recovery: 1.5, faulty: 2.5, spoilt: 2.5, spoiled: 2.5 },
    phrases: { "not working": 3.5, "stopped working": 3.5, "not charging": 3.5, "wont turn on": 3.5, "fell in water": 4, "what do you fix": 4, "what do you repair": 4 },
  },
  {
    id: "booking",
    keywords: { book: 3, booking: 3, appointment: 3, schedule: 3, reserve: 2, when: 0.5, bring: 1.5, visit: 1.5 },
    phrases: { "book a repair": 5, "make an appointment": 5, "drop off": 3, "walk in": 3, "how long": 2.5, "turnaround time": 3.5 },
  },
  {
    id: "repair_status",
    keywords: { status: 3, update: 2, ready: 2, done: 1.5, collected: 1.5, tracking: 2.5 },
    phrases: { "my repair": 4, "is it ready": 4, "repair status": 5, "any update": 3.5, "when will my": 4 },
  },
  {
    id: "warranty",
    keywords: { warranty: 5, guarantee: 4, refund: 3, return: 2.5, exchange: 2.5, fake: 1.5, original: 1.5, genuine: 1.5 },
    phrases: { "money back": 4, "how long is the warranty": 5, "is it original": 3.5 },
  },
  {
    id: "hours_location",
    keywords: { open: 2.5, close: 2.5, closed: 2.5, hour: 3, time: 1, located: 3, location: 3, address: 3, where: 2, find: 1, direction: 2.5, shop: 1, store: 1, sunday: 2, saturday: 1.5 },
    phrases: { "opening hours": 5, "business hours": 5, "what time": 3, "where are you": 4.5, "where is your": 4 },
  },
  {
    id: "payment_delivery",
    keywords: { pay: 3, payment: 3, transfer: 2.5, cash: 2.5, card: 2, pos: 2.5, deliver: 3, delivery: 3, shipping: 3, ship: 2.5, send: 1.5, waybill: 3, installment: 2.5 },
    phrases: { "pay on delivery": 5, "do you deliver": 5, "bank transfer": 4, "outside lagos": 3.5 },
  },
  {
    id: "human",
    keywords: { human: 4, agent: 4, person: 3, someone: 2.5, staff: 3, manager: 3, representative: 4, complain: 3, complaint: 3, whatsapp: 2.5, call: 2 },
    phrases: { "talk to": 3, "speak to": 3, "speak with": 3, "real person": 5, "customer care": 4, "customer service": 4, "not helpful": 4, "you are not helping": 5 },
  },
  {
    id: "thanks",
    keywords: { thank: 4, thanks: 4, thx: 4, appreciated: 3, helpful: 2.5, great: 1.5, perfect: 2, awesome: 2 },
    phrases: { "thank you": 5 },
  },
  {
    id: "goodbye",
    keywords: { bye: 4, goodbye: 5, later: 1.5, cya: 3 },
    phrases: { "see you": 3, "talk later": 4 },
  },
];

/** Confidence below this is treated as a miss (fallback / clarify). */
export const CONFIDENCE_THRESHOLD = 0.4;
