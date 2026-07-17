import type { ChatLogEntry, FeedbackVerdict, IntentId, LearnedState, Ticket } from "./types";
import { tokenize } from "./knowledge";
import { chatPersistence } from "./persistence";

// The chatbot's memory. All persistence goes through the driver returned by
// chatPersistence() (local files in dev, Supabase in production), and every
// write is fail-soft: a storage hiccup must never break a customer's reply —
// the learned state just falls back to the in-process cache until storage
// recovers.

const EMPTY_LEARNED: LearnedState = { tokenBoosts: {}, variantScores: {} };
let learnedCache: LearnedState | null = null;

export async function getLearned(): Promise<LearnedState> {
  try {
    const loaded = await chatPersistence().loadLearned();
    if (loaded) learnedCache = loaded;
  } catch (e) {
    console.error("chatbot: loading learned state failed, using cache", e);
  }
  return learnedCache ?? (learnedCache = structuredClone(EMPTY_LEARNED));
}

async function saveLearned(state: LearnedState) {
  learnedCache = state;
  try {
    await chatPersistence().saveLearned(state);
  } catch (e) {
    console.error("chatbot: persisting learned state failed", e);
  }
}

async function appendEvent(kind: "conversation" | "feedback" | "unanswered" | "ticket", payload: unknown) {
  try {
    await chatPersistence().append(kind, payload);
  } catch (e) {
    console.error(`chatbot: appending ${kind} event failed`, e);
  }
}

// ---- Learned state (the feedback loop's memory) ---------------------------

const TOKEN_BOOST_CAP = 2; // one token can never dominate an intent's score

export async function boostTokens(message: string, intent: IntentId, delta: number) {
  if (intent === "fallback") return;
  const learned = await getLearned();
  for (const t of tokenize(message)) {
    const forToken = (learned.tokenBoosts[t] ??= {});
    const next = (forToken[intent] ?? 0) + delta;
    forToken[intent] = Math.max(-TOKEN_BOOST_CAP, Math.min(TOKEN_BOOST_CAP, next));
  }
  await saveLearned(learned);
}

export async function scoreVariant(intent: IntentId, variantId: string, delta: number) {
  const learned = await getLearned();
  const key = `${intent}:${variantId}`;
  learned.variantScores[key] = (learned.variantScores[key] ?? 0) + delta;
  await saveLearned(learned);
}

// ---- Conversation log ------------------------------------------------------

// Recent entries stay in memory so /api/chat can read session context (last
// intent, consecutive misses) without a storage round-trip. On serverless
// hosts this cache is per-instance and best-effort — losing it only degrades
// miss-counting and handoff transcripts, never the reply itself.
const recent = new Map<string, ChatLogEntry[]>();
const RECENT_CAP = 20;

export async function logExchange(entry: ChatLogEntry) {
  const list = recent.get(entry.sessionId) ?? [];
  list.push(entry);
  if (list.length > RECENT_CAP) list.shift();
  recent.set(entry.sessionId, list);
  await appendEvent("conversation", entry);
  if (entry.intent === "fallback") {
    await appendEvent("unanswered", {
      at: entry.at,
      reason: "no_intent_matched",
      message: entry.userMessage,
      confidence: entry.confidence,
    });
  }
}

export function sessionHistory(sessionId: string): ChatLogEntry[] {
  return recent.get(sessionId) ?? [];
}

export function findEntry(sessionId: string, messageId: string): ChatLogEntry | undefined {
  return recent.get(sessionId)?.find((e) => e.messageId === messageId);
}

// ---- Feedback ---------------------------------------------------------------

export async function recordFeedback(entry: ChatLogEntry, verdict: FeedbackVerdict) {
  await appendEvent("feedback", {
    at: new Date().toISOString(),
    sessionId: entry.sessionId,
    messageId: entry.messageId,
    intent: entry.intent,
    variantId: entry.variantId,
    verdict,
    userMessage: entry.userMessage,
  });

  const delta = verdict === "up" ? 1 : -1;
  await scoreVariant(entry.intent, entry.variantId, delta);

  if (verdict === "up" && entry.intent !== "fallback") {
    // Confirmed good answer → nudge this phrasing toward this intent.
    await boostTokens(entry.userMessage, entry.intent, 0.25);
  }
  if (verdict === "down") {
    // Wrong or unhelpful → weaken the association and queue for review.
    if (entry.intent !== "fallback") await boostTokens(entry.userMessage, entry.intent, -0.25);
    await appendEvent("unanswered", {
      at: new Date().toISOString(),
      reason: "downvoted",
      message: entry.userMessage,
      intent: entry.intent,
      reply: entry.replyText,
    });
  }
}

// ---- Escalation tickets ------------------------------------------------------

export async function createTicket(t: Omit<Ticket, "id" | "at" | "status">): Promise<Ticket> {
  const ticket: Ticket = {
    ...t,
    id: `DG-${Date.now().toString(36).toUpperCase()}`,
    at: new Date().toISOString(),
    status: "open",
  };
  await appendEvent("ticket", ticket);
  return ticket;
}
