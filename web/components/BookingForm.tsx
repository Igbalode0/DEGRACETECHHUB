"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { repairServiceOptions, WHATSAPP_URL } from "@/lib/data";
import styles from "@/components/Form.module.css";

export default function BookingForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    device: "",
    service: repairServiceOptions[0],
    notes: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const lines = [
      "Hello DE-GRACE TECH HUB, I would like to book a repair.",
      "Name: " + (form.name || "-"),
      "Phone: " + (form.phone || "-"),
      "Device: " + (form.device || "-"),
      "Service: " + form.service,
      "Details: " + (form.notes || "-"),
    ];
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="book-name">Full Name</label>
          <input id="book-name" className={styles.input} value={form.name} onChange={set("name")} placeholder="Your name" />
        </div>
        <div>
          <label className={styles.label} htmlFor="book-phone">Phone Number</label>
          <input id="book-phone" className={styles.input} value={form.phone} onChange={set("phone")} placeholder="+234..." />
        </div>
      </div>
      <div className={styles.row2}>
        <div>
          <label className={styles.label} htmlFor="book-device">Device</label>
          <input id="book-device" className={styles.input} value={form.device} onChange={set("device")} placeholder="e.g. iPhone 13" />
        </div>
        <div>
          <label className={styles.label} htmlFor="book-service">Service Needed</label>
          <select id="book-service" className={styles.select} value={form.service} onChange={set("service")}>
            {repairServiceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={styles.label} htmlFor="book-notes">Describe the issue</label>
        <textarea id="book-notes" className={styles.textarea} rows={4} value={form.notes} onChange={set("notes")} placeholder="Tell us what's wrong..." />
      </div>
      <button type="button" className={styles.submitBtn} onClick={submit}>
        <WhatsAppIcon width={18} height={18} />
        Send Booking via WhatsApp
      </button>
      <p style={{ color: "#66666e", fontSize: "12.5px", textAlign: "center", margin: 0 }}>
        We&apos;ll confirm your appointment on WhatsApp within minutes.
      </p>
    </div>
  );
}
