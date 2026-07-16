export type IntentId =
  | "greeting"
  | "pricing"
  | "stock"
  | "repairs"
  | "booking"
  | "repair_status"
  | "warranty"
  | "hours_location"
  | "payment_delivery"
  | "human"
  | "thanks"
  | "goodbye"
  | "fallback";

export type ExtractedEntities = {
  products: { id: string; name: string; price: number; category?: string; soldOut?: boolean; score: number }[];
  repairs: { label: string; price?: string; score: number }[];
};

export type Classification = {
  intent: IntentId;
  confidence: number;
  entities: ExtractedEntities;
  /** Runner-up intent, used for "did you mean" suggestions on low confidence. */
  secondBest?: IntentId;
};

export type BotReply = {
  text: string;
  /** Quick-reply chips shown under the message. */
  suggestions: string[];
  /** True when the bot recommends handing off to a human. */
  escalate: boolean;
  /** Which answer variant produced the text — feedback scores key on this. */
  variantId: string;
};

export type ChatLogEntry = {
  messageId: string;
  sessionId: string;
  at: string;
  userMessage: string;
  intent: IntentId;
  confidence: number;
  variantId: string;
  replyText: string;
};

export type FeedbackVerdict = "up" | "down";

export type LearnedState = {
  /** token -> intent -> additive score boost, grown from feedback + rephrasings. */
  tokenBoosts: Record<string, Partial<Record<IntentId, number>>>;
  /** "intent:variantId" -> cumulative feedback score; the responder serves the best. */
  variantScores: Record<string, number>;
};

export type Ticket = {
  id: string;
  sessionId: string;
  at: string;
  name: string;
  phone: string;
  topic: string;
  transcript: string[];
  status: "open";
};
