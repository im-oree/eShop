# eShop — Deployment Guide

> Deploying the eShop marketplace. Local development details live in the [README](README.md).

## Prerequisites

- Node.js 16+ (18/20/22 recommended)
- A Firebase project with **Firestore** and **Email/Password Auth** enabled + a **service-account private key**
- A [Paystack](https://paystack.com) account (test mode is fine to start)
- (Optional) A [Brevo](https://www.brevo.com) account for transactional email

## 1. Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore** and **Authentication → Email/Password**.
3. Project Settings → Service Accounts → **Generate new private key** — this gives you `project_id`, `private_key`, and `client_email`.

## 2. Paystack setup

1. Sign up at [Paystack](https://paystack.com) and switch to **test mode** for development.
2. Settings → API Keys & Webhooks → copy the test **Secret Key** and **Public Key**.

## 3. Backend deployment (Railway / Render)

The backend is the **`backend/` directory** (not the repo root).

1. Push the repo to GitHub.
2. Create a service in Railway/Render with **root directory `backend`**.
3. Set the environment variables (see [README env vars](README.md#environment-variables)):

```env
NODE_ENV=production
APP_ENV=auto
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key       # \n must be escaped if pasted raw
FIREBASE_CLIENT_EMAIL=your-client-email
JWT_SECRET=your-long-random-secret
PAYSTACK_ENV=live
PAYSTACK_LIVE_SECRET_KEY=sk_live_xxx
PAYSTACK_LIVE_PUBLIC_KEY=pk_live_xxx
BREVO_API_KEY=your-brevo-api-key
SENDER_EMAIL=noreply@your-domain.com
SENDER_NAME=eShop
CORS_ORIGIN=https://your-frontend-domain.com
```

4. Build command: `npm run build` · Start command: `npm start`.

> **FIREBASE_PRIVATE_KEY note:** the value contains literal `\n` sequences. Paste it as a single line with `\n` intact (the app unescapes it in `config/index.ts`).

## 4. Frontend deployment (Vercel / Netlify)

The frontend is the **repository root**.

1. Import the repo; set the **root directory to the repo root** and the build command to `npm run build`.
2. Output directory: `dist`.
3. Set environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_ENV=production
VITE_FIREBASE_API_KEY=...       # only if you want FCM browser push
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 5. Paystack webhook

1. Paystack Dashboard → Settings → Webhooks.
2. Add URL: `https://your-backend-domain.com/api/payments/webhook`.
3. Subscribe to the **`charge.success`** event.
4. Ensure the backend is publicly reachable (HTTPS).

> The webhook signature verification is still a TODO in the codebase — treat this endpoint as trusted-network-only until that is implemented.

## Local development (recap)

```bash
# Backend — http://localhost:5000
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend — http://localhost:5173 (proxies /api → :5000)
cp .env.example .env && npm install && npm run dev
```

## Security checklist

- [ ] Firebase security rules restrict client access (all reads/writes go through the backend).
- [ ] `JWT_SECRET` is long, random, and not committed.
- [ ] `CORS_ORIGIN` is scoped to your real frontend domain.
- [ ] Paystack keys use the correct `PAYSTACK_ENV` (test vs live).
- [ ] Rate limiting is enabled (default 100 req / 15 min / IP).
- [ ] `BREVO_API_KEY` is not committed to the repo.
- [ ] HTTPS enforced on the frontend and backend.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Backend won't start | Check missing env vars (it lists them on failure); verify `FIREBASE_PRIVATE_KEY` newline escaping. |
| CORS errors in browser | Set `CORS_ORIGIN` to the exact frontend origin (or `*` for testing). |
| Frontend can't reach API | Set `VITE_API_BASE_URL`; locally, confirm the Vite proxy target `http://localhost:5000`. |
| Payments fail | Confirm `PAYSTACK_ENV` matches the keys used; check the webhook URL is reachable. |
