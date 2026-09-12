# eShop — Build Summary

> The canonical, always-up-to-date documentation is [README.md](README.md). This file is a high-level summary of what was delivered.

## What this is

A **full-stack, multi-vendor e-commerce marketplace** ("eShop"), built Nigeria-first (₦/kobo pricing) with global scalability in mind. Shoppers browse and buy; approved vendors run their own shops; admins oversee the platform.

## What's included

### Frontend (repository root — React 18 + Vite + TypeScript + Tailwind + Zustand)
- Responsive, mobile-first storefront with a dark-navy/green/amber design system.
- Product catalogue: pagination, category filter, search, sort, stock filter, featured rail.
- Product detail with gallery, features/specs, related products, and contact-seller.
- Cart (Zustand + backend sync), address book, checkout, Paystack payment, order tracking.
- Auth (login/signup), profile, apply-to-sell, notifications, buyer↔seller messaging.
- **Seller portal**: shop dashboard, product management, analytics, orders, employee access.
- **Admin dashboard**: overview, revenue analytics, seller verification, role management.

### Backend (`backend/` — Node.js + Express + TypeScript + Firebase)
- REST API with a consistent `{ success, message, data }` envelope and pagination.
- Firebase Admin (Firestore + Auth), JWT auth, bcrypt password hashing.
- Abstracted payment layer — **Paystack** implemented; Stripe/Flutterwave scaffolds.
- Brevo transactional email, FCM push notifications, in-app notifications.
- Rate limiting, CORS allowlist, environment auto-detection (`dev`/`staging`/`production`).
- Multi-seller order fan-out (`sellerOrders` linking collection).

## Roles

`user` (buyer) · `seller` · `employee` (scoped staff with RBAC templates) · `moderator` · `admin`

## Tech stack at a glance

| Layer | Stack |
| --- | --- |
| Frontend | React 18, TypeScript 5, Vite 5, Tailwind 3, Zustand, React Router 6, Recharts, lucide-react, Axios |
| Backend | Node.js, Express 4, TypeScript 5, tsx, Firebase Admin, jsonwebtoken, bcryptjs, cors, dotenv |
| Data | Firestore (`users`, `products`, `orders`, `carts`, `notifications`, `conversations`, `messages`, `sellerOrders`, `categories`) |
| Auth | Firebase Auth + JWT |
| Payments | Paystack (test/live) |
| Email | Brevo |
| Push | Firebase Cloud Messaging |

## How to run

```bash
npm install            # frontend
cd backend && npm install && cd ..   # backend
cp backend/.env.example backend/.env  # add credentials

cd backend && npm run dev    # API → http://localhost:5000
npm run dev                  # SPA → http://localhost:5173
```

## Documentation

- **[README.md](README.md)** — full overview, features, API reference, how it works, setup.
- **[QUICKSTART.md](QUICKSTART.md)** — 5-minute setup.
- **[ARCHITECTURE.md](ARCHITECTURE.md)** — system design & patterns.
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — production deployment.
- **[scripts/screenshots.mjs](scripts/screenshots.mjs)** — Playwright screenshot capture (`docs/screenshots/`).

## Known limitations (honest notes)

- Login issues a JWT after an email lookup; **password verification** against Firebase Auth is TODO.
- Paystack **webhook signature verification** is TODO.
- Stripe/Flutterwave providers are placeholders.
- Search filters in memory after a `limit(20)` Firestore scan.

See [README → Known limitations & roadmap](README.md#known-limitations--roadmap).
