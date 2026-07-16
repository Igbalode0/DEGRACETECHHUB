"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import { CloseIcon, WhatsAppIcon } from "@/components/icons";

type Feedback = "up" | "down";

type Message = {
  role: "user" | "bot";
  text: string;
  messageId?: string;
  suggestions?: string[];
  escalate?: boolean;
  feedback?: Feedback;
};

const SESSION_KEY = "dg_chat_session";

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

const WELCOME: Message = {
  role: "bot",
  text: "Hi! I'm the DE-GRACE assistant 👋 Ask me about prices, stock, repairs or bookings — I'll hand you to a human whenever you want.",
  suggestions: ["Repair price list", "What do you sell?", "Book a repair", "Opening hours"],
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [escalation, setEscalation] = useState<{ name: string; phone: string; sent?: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, escalation]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || typing) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", text }]);
      setTyping(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: getSessionId(), message: text }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data: { messageId: string; reply: string; suggestions: string[]; escalate: boolean } = await res.json();
        setMessages((m) => [
          ...m,
          { role: "bot", text: data.reply, messageId: data.messageId, suggestions: data.suggestions, escalate: data.escalate },
        ]);
        if (data.escalate) setEscalation({ name: "", phone: "" });
      } catch {
        setMessages((m) => [
          ...m,
          { role: "bot", text: "Sorry, I hit a snag reaching the server. Please try again, or contact us directly on WhatsApp." },
        ]);
      } finally {
        setTyping(false);
      }
    },
    [typing],
  );

  const giveFeedback = useCallback((messageId: string, verdict: Feedback) => {
    setMessages((m) => m.map((msg) => (msg.messageId === messageId ? { ...msg, feedback: verdict } : msg)));
    fetch("/api/chat/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: getSessionId(), messageId, verdict }),
    }).catch(() => {});
  }, []);

  const requestHuman = useCallback(async () => {
    if (!escalation || !escalation.name.trim() || !escalation.phone.trim()) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    try {
      const res = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          name: escalation.name,
          phone: escalation.phone,
          topic: lastUser?.text ?? "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { ticketId: string; whatsappUrl: string } = await res.json();
      setEscalation(null);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: `Done! Your request is logged as ticket ${data.ticketId} and the team will reach out shortly. Want a faster answer? Continue on WhatsApp below — your chat context goes with you.`,
          suggestions: [],
        },
      ]);
      window.open(data.whatsappUrl, "_blank");
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "I couldn't log that just now — please reach us directly on WhatsApp." }]);
    }
  }, [escalation, messages]);

  return (
    <>
      {!open && (
        <button type="button" className={styles.launcher} onClick={() => setOpen(true)} aria-label="Open chat assistant">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3C7.03 3 3 6.58 3 11c0 2.5 1.3 4.73 3.34 6.2L5.5 21l4.13-1.74c.76.16 1.55.24 2.37.24 4.97 0 9-3.58 9-8s-4.03-8.5-9-8.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="11" r="1" fill="currentColor" />
            <circle cx="12" cy="11" r="1" fill="currentColor" />
            <circle cx="15.5" cy="11" r="1" fill="currentColor" />
          </svg>
        </button>
      )}

      {open && (
        <div className={styles.panel} role="dialog" aria-label="DE-GRACE chat assistant">
          <div className={styles.header}>
            <div>
              <div className={styles.title}>DE-GRACE Assistant</div>
              <div className={styles.subtitle}>
                <span className={styles.dot} aria-hidden="true" /> Typically replies instantly
              </div>
            </div>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          <div className={styles.messages} ref={listRef}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? styles.rowUser : styles.rowBot}>
                <div className={msg.role === "user" ? styles.bubbleUser : styles.bubbleBot}>{msg.text}</div>

                {msg.role === "bot" && msg.messageId && (
                  <div className={styles.feedback}>
                    {msg.feedback ? (
                      <span className={styles.feedbackThanks}>{msg.feedback === "up" ? "Glad it helped!" : "Thanks — we'll improve this."}</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={styles.feedbackBtn}
                          onClick={() => giveFeedback(msg.messageId!, "up")}
                          aria-label="Helpful answer"
                        >
                          👍
                        </button>
                        <button
                          type="button"
                          className={styles.feedbackBtn}
                          onClick={() => giveFeedback(msg.messageId!, "down")}
                          aria-label="Unhelpful answer"
                        >
                          👎
                        </button>
                      </>
                    )}
                  </div>
                )}

                {msg.role === "bot" && i === messages.length - 1 && !typing && (msg.suggestions?.length ?? 0) > 0 && (
                  <div className={styles.chips}>
                    {msg.suggestions!.map((s) => (
                      <button key={s} type="button" className={styles.chip} onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {escalation && (
              <div className={styles.escalate}>
                <div className={styles.escalateTitle}>Connect with the team</div>
                <input
                  className={styles.escalateInput}
                  placeholder="Your name"
                  aria-label="Your name"
                  value={escalation.name}
                  onChange={(e) => setEscalation((s) => s && { ...s, name: e.target.value })}
                />
                <input
                  className={styles.escalateInput}
                  placeholder="Phone / WhatsApp number"
                  aria-label="Phone or WhatsApp number"
                  value={escalation.phone}
                  onChange={(e) => setEscalation((s) => s && { ...s, phone: e.target.value })}
                />
                <button
                  type="button"
                  className={styles.escalateBtn}
                  onClick={requestHuman}
                  disabled={!escalation.name.trim() || !escalation.phone.trim()}
                >
                  <WhatsAppIcon /> Request a human
                </button>
                <button type="button" className={styles.escalateCancel} onClick={() => setEscalation(null)}>
                  Keep chatting with the bot
                </button>
              </div>
            )}

            {typing && (
              <div className={styles.rowBot}>
                <div className={`${styles.bubbleBot} ${styles.typing}`} aria-label="Assistant is typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form
            className={styles.inputBar}
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about prices, stock, repairs…"
              aria-label="Type your message"
              maxLength={500}
            />
            <button type="submit" className={styles.sendBtn} disabled={!input.trim() || typing} aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12 20 4l-4 8 4 8-16-8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
