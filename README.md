# 🥟 Victoria's Restaurant — Dim Sum Ordering Demo

A small dim sum ordering site built to showcase [Rainforest Payments](https://rainforestpay.com) embedded components — checkout, receipts, and merchant reporting — wired up end to end in a real Node/Express app.

Order dumplings, pay through an embedded card form, get a receipt, then flip over to the merchant side to watch the payment and deposit reports update live.

## ✨ What's inside

| Page | Route | What it shows |
|---|---|---|
| Menu | `/index.html` | Browse the dim sum menu, add items to a cart, check out |
| Checkout | `/checkout.html` | Embedded Rainforest **payment component** collects card details and pays |
| Receipt | `/receipt.html` | Embedded Rainforest **receipt component** for the completed order |
| Merchant Report | `/report.html` | Embedded **payment report** + **deposit report** components, with a "simulate deposit" action |

The Express server (`server.js`) never talks to Rainforest directly from the browser — it brokers short-lived, scoped **session keys** through `/api/*` routes (`src/routes/api.js`), and each page mounts the matching Rainforest web component with that key.

## 🧰 Tech stack

- **Node.js** + **Express** — static file serving and a thin API layer
- Plain **HTML/CSS/JS** on the frontend (`public/`) — no framework, no build step
- [Rainforest Payments](https://rainforestpay.com) sandbox components (`sandbox.payment.js`, `sandbox.merchant.js`) loaded straight from Rainforest's CDN

## 🚀 Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
RAINFOREST_API_KEY=your_sandbox_api_key
RAINFOREST_MERCHANT_ID=your_merchant_id
RAINFOREST_BASE_URL=https://api.sandbox.rainforestpay.com
```

### 3. Run it

```bash
npm start       # node server.js
# or
npm run dev      # node --watch server.js, restarts on change
```

Then open **http://localhost:3000** 🎉

## 🗂️ Project layout

```
server.js                  # Express app entrypoint
src/
  rainforestClient.js       # Thin fetch wrapper around the Rainforest API
  routes/api.js              # Routes that mint payin configs & session keys
public/
  index.html                 # Menu / cart
  checkout.html               # Embedded payment component
  receipt.html                 # Embedded receipt component
  report.html                   # Embedded merchant report components
  css/style.css                  # Shared styling
  js/                              # Per-page frontend logic
```

## 🔐 A note on security

Session keys are scoped (e.g. `group#payment_component`, constrained to a specific `payin_id` or `merchant_id`) and short-lived (1 hour TTL). The Rainforest API key itself never leaves the server — only these narrow session keys are handed to the browser. This is a sandbox/demo integration and isn't meant for production use as-is.
