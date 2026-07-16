import { findEntry, recordFeedback } from "@/lib/chatbot/store";

export async function POST(request: Request) {
  let body: { sessionId?: unknown; messageId?: unknown; verdict?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  const messageId = typeof body.messageId === "string" ? body.messageId.slice(0, 64) : "";
  const verdict = body.verdict === "up" || body.verdict === "down" ? body.verdict : null;
  if (!sessionId || !messageId || !verdict) {
    return Response.json({ error: "sessionId, messageId and verdict ('up'|'down') are required" }, { status: 400 });
  }

  const entry = findEntry(sessionId, messageId);
  if (!entry) {
    // Session log rotated (server restart) — accept silently so the UI stays simple.
    return Response.json({ ok: true, recorded: false });
  }

  await recordFeedback(entry, verdict);
  return Response.json({ ok: true, recorded: true });
}
