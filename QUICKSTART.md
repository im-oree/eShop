# eShop — Quick Start

> 5-minute setup for the eShop multi-vendor marketplace.

## 1. Install

```bash
# Frontend — lives at the repository ROOT (not a frontend/ folder)
npm install

# Backend
cd backend
npm install
cd ..
```

## 2. Configure

```bash
cp .env.example .env               # frontend (optional)
cp backend/.env.example backend/.env
# Edit backend/.env with your Firebase + Paystack credentials
```

## 3. Run

Terminal 1 — backend (http://localhost:5000):

```bash
cd backend
npm run dev
```

Terminal 2 — frontend (http://localhost:5173):

```bash
npm run dev
```

Visit **http://localhost:5173** — Vite proxies `/api/*` to the backend automatically.

## Key endpoints

| Purpose | Endpoint |
| --- | --- |
| Health check | `GET /health` |
| Products | `GET /api/products` |
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Orders | `GET/POST /api/orders` |
| Payments | `POST /api/payments/initialize`, `POST /api/payments/verify` |

## Project layout

- `/` (root) — **frontend** (React + Vite + Tailwind + Zustand)
- `/backend` — **backend** (Express + TypeScript + Firebase)
- `/README.md` — full documentation
- `/ARCHITECTURE.md` — design notes
- `/DEPLOYMENT.md` — deployment guide

## Technologies

- **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Zustand, React Router, Recharts
- **Backend**: Node.js, Express 4, TypeScript, Firebase (Firestore + Auth), JWT, Paystack, Brevo
- **Database**: Firestore · **Auth**: Firebase Auth + JWT · **Push**: FCM

## Brand palette

- Primary: `#0F172A` (dark navy) · Secondary: `#16A34A` (green)
- Accent: `#F59E0B` (amber) · Danger: `#DC2626` (red) · Background: `#F8FAFC`

## Important notes

- ✅ Prices are stored in **kobo** (₦1 = 100 kobo).
- ✅ Firebase is accessed **only from the backend** (Admin SDK); the frontend Web SDK is used for FCM messaging.
- ✅ Environments auto-detect: `dev` / `staging` / `production` (`APP_ENV` override).
- ✅ Payments are abstracted — Paystack implemented; Stripe/Flutterwave scaffolded.
- ✅ Multi-role: `user`, `seller`, `admin`, `moderator`, `employee`.

## Screenshots

```bash
npm i -D @playwright/test && npx playwright install chromium
npm run dev                 # in another terminal
npm run screenshots         # writes docs/screenshots/
```
