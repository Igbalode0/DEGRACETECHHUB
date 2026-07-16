import { randomUUID } from "crypto";
import { classify } from "@/lib/chatbot/classifier";
import { respond } from "@/lib/chatbot/responder";
import { boostTokens, getLearned, logExchange, sessionHistory } from "@/lib/chatbot/store";
import { listPublicProducts } from "@/lib/catalog/repo";

export async function POST(request: Request) {
  let body: { sessionId?: unknown; message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (!sessionId || !message) {
    return Response.json({ error: "sessionId and message are required" }, { status: 400 });
  }

  const learned = await getLearned();
  // Live admin-managed catalog, so stock/pricing answers are never stale.
  const liveProducts = await listPublicProducts().catch(() => undefined);
  const classification = classify(message, learned, liveProducts);

  const history = sessionHistory(sessionId);
  const prev = history[history.length - 1];
  let consecutiveMisses = 0;
  for (let i = history.length - 1; i >= 0 && history[i].intent === "fallback"; i--) consecutiveMisses++;
  if (classification.intent === "fallback") consecutiveMisses++;

  // Rephrase learning: a miss followed by a confident hit means the missed
  // wording probably meant the same thing — teach the classifier that link.
  if (prev?.intent === "fallback" && classification.intent !== "fallback" && classification.confidence >= 0.6) {
    await boostTokens(prev.userMessage, classification.intent, 0.5);
  }

  const reply = respond(classification, consecutiveMisses, learned);
  const messageId = randomUUID();

  await logExchange({
    messageId,
    sessionId,
    at: new Date().toISOString(),
    userMessage: message,
    intent: classification.intent,
    confidence: classification.confidence,
    variantId: reply.variantId,
    replyText: reply.text,
  });

  return Response.json({
    messageId,
    reply: reply.text,
    suggestions: reply.suggestions,
    escalate: reply.escalate,
    intent: classification.intent,
    confidence: classification.confidence,
  });
}
