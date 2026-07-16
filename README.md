# DE-GRACE TECH HUB

Gadget store & repair hub — e-commerce storefront, self-learning support chatbot, and a live admin dashboard. Built with Next.js 16 (App Router), React 19, and TypeScript.

**Whether you need a phone repaired, a new laptop, premium accessories, or expert technical support — quality you can trust.**

## Features

### 🛍 Storefront (`/`, `/shop`, `/repairs`, `/contact`)
- Product catalog with category filters, cart drawer (persists across tabs), and WhatsApp checkout
- Repair services with transparent price list and online booking form
- Live catalog: sold-out and hidden products update in open tabs within seconds

### 💬 Support chatbot
- Intent recognition (pricing, stock, repairs, bookings, hours, delivery, and more) with fuzzy product matching — no external AI API, free to run
- Answers stock and pricing questions from the live admin-managed catalog
- Feedback loop: 👍/👎 on every answer refines wording and classification over time; missed questions land in a review queue
- Escalates to a human (logged ticket + WhatsApp handoff with chat context) on request or after repeated misses

### 🔐 Admin dashboard (`/admin`)
- Password-protected (HMAC-signed session cookie)
- Add/edit products: name, description, price, category, colors, tag, image upload
- One-click toggles for **Active/Hidden** and **In stock/Sold out** — changes go live on the shop instantly
- Storage abstraction: zero-setup file store out of the box, switches to **Supabase** (Postgres + Storage) automatically when keys are configured

## Getting started

```bash
cd web
npm install
```

Create `web/.env.local`:

```bash
# Required — admin panel login
ADMIN_PASSWORD=choose-a-strong-password

# Optional — switch product storage to Supabase
# (run web/supabase-schema.sql in the Supabase SQL editor and create a
#  public storage bucket named "product-images" first)
# NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Then:

```bash
npm run dev
```

- Store: http://localhost:3000
- Admin: http://localhost:3000/admin

## Deploying

This app has a server side (admin panel, chatbot, product API), so it **cannot run on GitHub Pages** — it needs a Next.js host.

**Vercel (easiest):** import this repo at vercel.com, set **Root Directory** to `web`, add the `ADMIN_PASSWORD` environment variable, and deploy.

> ⚠️ On serverless hosts like Vercel the local file store does not persist — configure the Supabase variables above so products and images live in Supabase. Hosts with a persistent disk (Railway, Render, a VPS) run the file store as-is.

## Project structure

```
web/
  app/
    (site)/        customer-facing pages (home, shop, repairs, contact)
    admin/         admin dashboard + login (own layout, no store chrome)
    api/
      chat/        chatbot: message handling, feedback, human escalation
      products/    public catalog feed (polled by the shop for live updates)
    uploads/       serves admin-uploaded product images (file-store mode)
  components/      UI components (+ admin/ and chat/ subfolders)
  lib/
    catalog/       product repository (file store + Supabase adapter)
    chatbot/       intent engine, knowledge base, learning store
    admin/         session auth
  data/            runtime state (gitignored): products, uploads, chat learning
  supabase-schema.sql
```
