"use client";

import { useState } from "react";
import { WHATSAPP_URL } from "@/lib/data";
import styles from "@/components/Form.module.css";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const lines = [
      "Hello DE-GRACE TECH HUB!",
      "Name: " + (form.name || "-"),
      "Phone: " + (form.phone || "-"),
      "Message: " + (form.message || "-"),
    ];
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <div className={styles.row2}>
        <input className={styles.input} value={form.name} onChange={set("name")} placeholder="Your name" aria-label="Your name" />
        <input className={styles.input} value={form.phone} onChange={set("phone")} placeholder="Phone (optional)" aria-label="Phone (optional)" />
      </div>
      <textarea
        className={styles.textarea}
        rows={4}
        value={form.message}
        onChange={set("message")}
        placeholder="How can we help?"
        aria-label="How can we help?"
      />
      <button type="button" className={styles.submitBtn} onClick={submit}>
        Send via WhatsApp
      </button>
    </div>
  );
}
