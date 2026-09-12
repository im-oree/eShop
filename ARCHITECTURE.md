# eShop — Architecture & Development Guide

> Complementary design notes to the [README](README.md). The README's "Architecture" and "How it works" sections are the best starting point.

## System overview

```
Frontend (Vite SPA @ :5173)  ──REST/JSON──▶  Backend (Express @ :5000)  ──▶  Firestore / Auth
        │                                            │
        └── Zustand + React Router ──┐                ├── PaystackProvider
                                     │                ├── StripeProvider (stub)
        Typed services (src/services)│                ├── FlutterwaveProvider (stub)
                                     │                ├── EmailService (Brevo)
                                     │                └── NotificationService (FCM)
```

- The frontend never talks to Firebase for data — it talks to the Express API, which is the only place with Firebase Admin credentials.
- The frontend Web SDK (`src/services/firebaseClient.ts`) exists solely for FCM browser push.

## Frontend architecture

```
src/
├── App.tsx           # route table
├── components/       # presentational + layout components
├── pages/            # one file per route
├── services/         # typed wrappers around apiClient
├── store/            # Zustand: authStore, cartStore
├── hooks/            # useAsync, useFetch
├── utils/            # formatPrice, dates, orderStage, rbac
└── types/            # models (mirrors backend types)
```

### State ownership

- **Auth** → `authStore`. Holds `user`, `token`, `currentRole`. The `currentRole` concept lets a seller toggle between Buyer and Seller views.
- **Cart** → `cartStore`. Local-first; each mutation `POST /api/cart` so the cart survives reloads for logged-in users.
- **Server data** → fetched per page via `services/*` (no global cache; light polling on some pages, e.g. Home re-fetches every 15s).

### Session restore

On mount, `Layout` reads `localStorage.authToken` and, if present, calls `GET /api/auth/me`. Any `401` clears the token and redirects to `/login` (handled centrally by the Axios interceptor in `services/api.ts`).

## Backend architecture

```
backend/src/
├── config/        # loadConfig() + environment detection + Firebase init
├── middlewares/   # authenticate, optionalAuth, requireAdmin, rateLimit, errorHandler
├── routes/        # thin HTTP handlers → delegate to services
├── services/      # business logic + Firestore access
├── providers/     # payment provider abstraction
├── utils/         # JWT/bcrypt, helpers, response envelope, rbac
├── types/         # domain models
├── app.ts         # middleware + route wiring
└── server.ts      # entry point
```

### Layering rules

1. **Routes** parse/validate input and call a service; they don't touch Firestore directly (except the messaging routes, which manage the `conversations`/`messages` collections inline).
2. **Services** own one collection each and return typed domain objects.
3. **Providers** are swapped through `PaymentServiceFactory` — add a provider by implementing `IPaymentProvider` and registering it.

### Response envelope

```ts
sendSuccess(res, data, message, 200)   // → { success, message, data }
sendError(res, error, 400, message)     // → { success, message, error }
sendPaginated(res, items, total, page, limit) // → { success, message, data: { items, total, page, limit, pages } }
```

## Key flows

### Authentication

1. `POST /api/auth/signup` → `UserService.create` → Firebase Auth `createUser` → Firestore `users/{uid}` → JWT issued.
2. Subsequent requests carry `Authorization: Bearer <token>`; `authenticate` verifies it with `config.jwt.secret`.
3. `GET /api/auth/me` re-hydrates the frontend session from the token.

### Checkout & payment

See the README ["Checkout & payment flow"](README.md#checkout--payment-flow). Key details:

- On verification, the order's `paymentStatus` becomes `completed` and its `status` becomes `noted` (the first fulfilment stage).
- A `sellerOrders` document is written **per seller** so each vendor only sees their slice of a multi-seller order.
- Buyer and seller emails + in-app/FCM notifications are fired asynchronously so verification stays fast.

### Multi-seller order visibility

`GET /api/orders/seller` fetches the seller's products, then filters all orders server-side for items that match — with a fallback to the `sellerOrders` linking collection.

### RBAC for employees

`utils/rbac.ts` (both sides) maps a `role` + `employeePermissions` to an effective permission set. `hasAccess(level, 'read'|'write')` is checked in product, order, and message routes for `employee` accounts.

## Adding a feature (recipe)

**Backend**
1. Add types to `backend/src/types/index.ts`.
2. Create/extend a service in `backend/src/services/`.
3. Create/extend a route in `backend/src/routes/` and mount it in `backend/src/app.ts`.

**Frontend**
1. Add a wrapper in `src/services/`.
2. Add a page in `src/pages/` and register it in `src/App.tsx`.
3. Add store state only if it's shared across pages.

## Useful commands

```bash
# Frontend
npm run dev         # dev server (5173)
npm run build       # tsc + vite build
npm run type-check  # tsc --noEmit

# Backend
cd backend
npm run dev         # tsx watch (5000)
npm run build       # tsc
npm run type-check
npm run seed:products
```

## Performance tips

- Keep list queries paginated (`page`/`limit`); the admin/seller analytics endpoints fetch broad sets and aggregate in memory — a good place to add Firestore indexes/aggregations at scale.
- Use `React.memo`/`React.lazy` for heavy pages; Home already re-fetches on a light interval rather than streaming.
- Add composite indexes for combined `where` queries (category + featured, etc.).
