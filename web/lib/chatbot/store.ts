import { promises as fs } from "fs";
import path from "path";
import type { ChatLogEntry, FeedbackVerdict, IntentId, LearnedState, Ticket } from "./types";
import { tokenize } from "./knowledge";

// File-backed store so the bot's memory survives restarts with zero infra.
// Everything goes through this module's exported functions — swapping to a
// real database later means reimplementing this file only, nothing else.
//
//   data/chatbot/learned.json        token boosts + answer-variant scores
//   data/chatbot/conversations.jsonl every exchange (append-only)
//   data/chatbot/feedback.jsonl      every thumbs up/down (append-only)
//   data/chatbot/unanswered.jsonl    learning queue: misses + downvoted answers
//   data/chatbot/tickets.json        open escalations to a human

const DATA_DIR = path.join(process.cwd(), "data", "chatbot");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown) {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(value, null, 2), "utf8");
}

async function appendJsonl(file: string, value: unknown) {
  await ensureDir();
  await fs.appendFile(path.join(DATA_DIR, file), JSON.stringify(value) + "\n", "utf8");
}

// ---- Learned state (the feedback loop's memory) ---------------------------

const EMPTY_LEARNED: LearnedState = { tokenBoosts: {}, variantScores: {} };

export async function getLearned(): Promise<LearnedState> {
  return readJson("learned.json", EMPTY_LEARNED);
}

const TOKEN_BOOST_CAP = 2; // one token can never dominate an intent's score

export async function boostTokens(message: string, intent: IntentId, delta: number) {
  if (intent === "fallback") return;
  const learned = await getLearned();
  for (const t of tokenize(message)) {
    const forToken = (learned.tokenBoosts[t] ??= {});
    const next = (forToken[intent] ?? 0) + delta;
    forToken[intent] = Math.max(-TOKEN_BOOST_CAP, Math.min(TOKEN_BOOST_CAP, next));
  }
  await writeJson("learned.json", learned);
}

export async function scoreVariant(intent: IntentId, variantId: string, delta: number) {
  const learned = await getLearned();
  const key = `${intent}:${variantId}`;
  learned.variantScores[key] = (learned.variantScores[key] ?? 0) + delta;
  await writeJson("learned.json", learned);
}

// ---- Conversation log ------------------------------------------------------

// Recent entries stay in memory so /api/chat can read session context (last
// intent, consecutive misses) without re-reading the JSONL on every message.
const recent = new Map<string, ChatLogEntry[]>();
const RECENT_CAP = 20;

export async function logExchange(entry: ChatLogEntry) {
  const list = recent.get(entry.sessionId) ?? [];
  list.push(entry);
  if (list.length > RECENT_CAP) list.shift();
  recent.set(entry.sessionId, list);
  await appendJsonl("conversations.jsonl", entry);
  if (entry.intent === "fallback") {
    await appendJsonl("unanswered.jsonl", {
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
  await appendJsonl("feedback.jsonl", {
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
    await appendJsonl("unanswered.jsonl", {
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
  const tickets = await readJson<Ticket[]>("tickets.json", []);
  const ticket: Ticket = {
    ...t,
    id: `DG-${Date.now().toString(36).toUpperCase()}`,
    at: new Date().toISOString(),
    status: "open",
  };
  tickets.push(ticket);
  await writeJson("tickets.json", tickets);
  return ticket;
}
