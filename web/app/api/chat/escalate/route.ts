import { WHATSAPP_URL } from "@/lib/data";
import { createTicket, sessionHistory } from "@/lib/chatbot/store";

export async function POST(request: Request) {
  let body: { sessionId?: unknown; name?: unknown; phone?: unknown; topic?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 300) : "";
  if (!sessionId || !name || !phone) {
    return Response.json({ error: "sessionId, name and phone are required" }, { status: 400 });
  }

  // Last few exchanges give the human agent context without asking the
  // customer to repeat themselves.
  const transcript = sessionHistory(sessionId)
    .slice(-6)
    .map((e) => `Customer: ${e.userMessage}`);

  const ticket = await createTicket({ sessionId, name, phone, topic, transcript });

  const lines = [
    `Hello DE-GRACE TECH HUB! (chat handoff ${ticket.id})`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    topic ? `Issue: ${topic}` : null,
    transcript.length ? `Recent questions:\n${transcript.join("\n")}` : null,
  ].filter(Boolean);

  return Response.json({
    ok: true,
    ticketId: ticket.id,
    whatsappUrl: `${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n\n"))}`,
  });
}
