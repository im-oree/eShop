/**
 * eShop — screenshot capture script (Playwright)
 *
 * Captures representative screenshots of the storefront for use in the README.
 *
 * The app is a Vite SPA whose data comes from a REST API (Express backend).
 * This script runs against the Vite dev server and mocks the `/api/**` responses
 * in the browser, so screenshots can be produced without a live backend,
 * Firebase project, or Paystack keys.
 *
 * Usage:
 *   1. Start the frontend:        npm run dev          (http://localhost:5173)
 *   2. Capture screenshots:       npm run screenshots
 *
 * Environment variables:
 *   BASE_URL                 Base URL of the running frontend (default http://localhost:5173)
 *   CHROMIUM_EXECUTABLE_PATH Path to a Chromium binary to use instead of the
 *                            Playwright-bundled one (e.g. `npx playwright install chromium`
 *                            is unavailable in some sandboxes — @sparticuz/chromium works there).
 */

import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots')
mkdirSync(OUT_DIR, { recursive: true })

/* ─────────────────────────── Mock data ─────────────────────────── */

const now = new Date().toISOString()

function productImage(name, category, i) {
  const palette = [
    ['#0F172A', '#16A34A'],
    ['#1E3A8A', '#3B82F6'],
    ['#7C2D12', '#F59E0B'],
    ['#14532D', '#22C55E'],
    ['#581C87', '#A855F7'],
    ['#0C4A6E', '#0EA5E9'],
    ['#4C0519', '#F43F5E'],
    ['#134E4A', '#14B8A6'],
  ]
  const [c1, c2] = palette[i % palette.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="600" height="450" fill="url(#g)"/>
<circle cx="470" cy="80" r="140" fill="#ffffff" opacity="0.08"/>
<circle cx="110" cy="410" r="100" fill="#ffffff" opacity="0.08"/>
<text x="40" y="360" font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${name}</text>
<text x="40" y="405" font-family="Arial, sans-serif" font-size="22" fill="#ffffff" opacity="0.8">${category}</text>
</svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const products = [
  { name: 'Wireless Bluetooth Headphones', category: 'Electronics', price: 24500, salePrice: 19900, discount: 18, stock: 34, featured: true, tags: ['audio', 'wireless'] },
  { name: "Men's Classic Denim Jacket", category: 'Fashion & Apparel', price: 18000, stock: 22, featured: true, tags: ['fashion', 'denim'] },
  { name: '4-Pack Alkaline AA Batteries', category: 'Electronics', price: 8500, salePrice: 7650, discount: 10, stock: 120, featured: false, tags: ['batteries', 'household'] },
  { name: 'Smartphone 6.5" HD+ 128GB', category: 'Mobile & Accessories', price: 185000, stock: 8, featured: true, tags: ['phone', 'android'] },
  { name: 'Ceramic Cookware Set (5pcs)', category: 'Home & Garden', price: 42000, salePrice: 36000, discount: 14, stock: 3, featured: false, tags: ['kitchen', 'ceramic'] },
  { name: 'Non-Slip Yoga Mat', category: 'Sports & Outdoors', price: 12500, stock: 45, featured: false, tags: ['fitness', 'yoga'] },
  { name: 'Vitamin C Serum 30ml', category: 'Health & Beauty', price: 9500, stock: 60, featured: true, tags: ['skincare', 'serum'] },
  { name: 'RGB Mechanical Keyboard', category: 'Computing', price: 38000, salePrice: 34000, discount: 10, stock: 0, featured: false, tags: ['keyboard', 'gaming'] },
  { name: 'Kids Building Blocks 100pcs', category: 'Toys & Games', price: 15000, stock: 27, featured: false, tags: ['toys', 'building'] },
  { name: 'Bestselling Novel Collection', category: 'Books & Media', price: 20000, stock: 15, featured: false, tags: ['books', 'fiction'] },
].map((p, i) => ({
  id: `p${i + 1}`,
  name: p.name,
  sellerName: 'Lagos Gadgets',
  sellerId: 'u-seller',
  description:
    `${p.name} — a quality ${p.category.toLowerCase()} item curated for the Nigerian market. ` +
    'Ships nationwide with fast delivery, secure checkout via Paystack, and easy returns. ' +
    'Backed by responsive seller support and order tracking from checkout to doorstep.',
  price: p.price,
  currency: 'NGN',
  images: [productImage(p.name, p.category, i)],
  category: p.category,
  tags: p.tags,
  stock: p.stock,
  discount: p.discount,
  salePrice: p.salePrice,
  featured: p.featured,
  features: ['Brand new', 'Original quality', 'Warranty included', 'Nationwide delivery'],
  specs: { Brand: 'eShop Select', Condition: 'New', 'Delivery Time': '2–5 business days' },
  createdAt: now,
  updatedAt: now,
}))

const buyer = {
  id: 'u-buyer', email: 'ada@example.com', name: 'Ada Obi', role: 'user',
  addresses: [], createdAt: now, updatedAt: now,
}

const seller = {
  id: 'u-seller', email: 'shop@lagosgadgets.ng', name: 'Chidi Emeka', role: 'seller',
  sellerProfile: { shopName: 'Lagos Gadgets', shopDescription: 'Premium electronics delivered fast across Nigeria.', rating: 4.8, totalReviews: 214, followers: 1204 },
  addresses: [], createdAt: now, updatedAt: now,
}

const admin = {
  id: 'u-admin', email: 'admin@eshop.ng', name: 'Platform Admin', role: 'admin',
  addresses: [], createdAt: now, updatedAt: now,
}

const cartItems = [
  { productId: 'p1', quantity: 1, price: 19900 },
  { productId: 'p3', quantity: 2, price: 7650 },
]

const notifications = [
  { id: 'n1', userId: 'u-buyer', type: 'payment_confirmed', title: 'Payment confirmed', message: 'Payment for order #1 was confirmed successfully.', priority: 'important', link: '/orders/1', readAt: null, createdAt: now, updatedAt: now },
  { id: 'n2', userId: 'u-buyer', type: 'order_status_updated', title: 'Order in_transit', message: 'Your order #1 is now in transit.', priority: 'normal', link: '/orders/1', readAt: null, createdAt: now, updatedAt: now },
]

const adminOverview = {
  users: { totalUsers: 1284, activeUsers: 512, sellerCount: 96, users: [buyer, seller, admin] },
  revenue: {
    totalRevenue: 8425000,
    today: 118000, thisWeek: 742000, thisMonth: 2912000,
    timeline: [
      { label: 'Mon', date: '2026-09-07', revenue: 90000, orders: 6 },
      { label: 'Tue', date: '2026-09-08', revenue: 124000, orders: 9 },
      { label: 'Wed', date: '2026-09-09', revenue: 86000, orders: 5 },
      { label: 'Thu', date: '2026-09-10', revenue: 152000, orders: 11 },
      { label: 'Fri', date: '2026-09-11', revenue: 118000, orders: 8 },
      { label: 'Sat', date: '2026-09-12', revenue: 172000, orders: 13 },
    ],
  },
  products: { totalProducts: 2314 },
  sellerVerification: { pending: [seller], approved: 96 },
}

const adminRevenue = {
  range: 'week',
  totalRevenue: 8425000,
  today: 118000,
  thisWeek: 742000,
  series: [
    { label: 'Mon', amount: 90000, count: 6 },
    { label: 'Tue', amount: 124000, count: 9 },
    { label: 'Wed', amount: 86000, count: 5 },
    { label: 'Thu', amount: 152000, count: 11 },
    { label: 'Fri', amount: 118000, count: 8 },
    { label: 'Sat', amount: 172000, count: 13 },
  ],
}

const sellerAnalytics = {
  series: [
    { label: 'Sep 06', amount: 12000 }, { label: 'Sep 07', amount: 19000 },
    { label: 'Sep 08', amount: 9000 }, { label: 'Sep 09', amount: 24000 },
    { label: 'Sep 10', amount: 15000 }, { label: 'Sep 11', amount: 28000 },
    { label: 'Sep 12', amount: 21000 },
  ],
  topProducts: products.slice(0, 6).map((p) => ({ id: p.id, name: p.name, salesCount: 40, revenue: p.price * 40 })),
  summary: { totalProducts: products.length, totalOrders: 132, totalSalesCount: 540, totalRevenue: 128000, avgOrderValue: 4200, inventoryValue: 0, avgPrice: 0, totalReviews: 214, rating: 4.8 },
  charts: { salesSeries: [], categorySeries: [], inventoryStatus: { inStock: 8, lowStock: 1, outOfStock: 1 } },
}

/* ─────────────────────────── Helpers ─────────────────────────── */

const single = (data) => ({ success: true, message: 'Success', data })
const paginated = (items) => ({ success: true, message: 'Success', data: { items, total: items.length, page: 1, limit: 20, pages: 1 } })

async function launchBrowser() {
  const opts = { headless: true }
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    // A sandbox-friendly Chromium (e.g. @sparticuz/chromium). Keep the flags
    // minimal and stable — the full serverless flag set (swiftshader/GPU and
    // --single-process) can segfault on some hosts.
    const { default: SparticuzChromium } = await import('@sparticuz/chromium')
    opts.executablePath = await SparticuzChromium.executablePath()
    opts.args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--no-zygote',
    ]
  }
  return chromium.launch(opts)
}

async function mockApi(page, user) {
  await page.route('**/api/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.replace(/^\/api/, '')
    const method = req.method()
    const respond = (status, body) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

    // Auth
    if (path === '/auth/me') {
      if (!user) return respond(401, { success: false, message: 'Unauthorized' })
      return respond(200, single(user))
    }

    // Products
    if (path === '/products' || path === '/products/search') return respond(200, paginated(products))
    if (path === '/products/featured') return respond(200, single(products.filter((p) => p.featured)))
    if (path === '/products/mine') return respond(200, single(products))
    if (path === '/products/mine/analytics') return respond(200, single(sellerAnalytics))
    const detailMatch = path.match(/^\/products\/([^/]+)$/)
    if (detailMatch) {
      const product = products.find((p) => p.id === decodeURIComponent(detailMatch[1])) || products[0]
      return respond(200, single(product))
    }

    // Cart
    if (path === '/cart' && method === 'GET') return respond(200, single(cartItems))
    if (path === '/cart') return respond(200, single(cartItems))

    // Notifications
    if (path === '/notifications/unread-count') return respond(200, single({ count: notifications.length }))
    if (path === '/notifications') return respond(200, paginated(notifications))

    // Orders
    if (path === '/orders' || path === '/orders/seller') return respond(200, paginated([]))

    // Messaging
    if (path === '/messages/conversations') return respond(200, paginated([]))

    // Users / employees
    if (path === '/users/employee-role-templates') return respond(200, single({}))
    if (path === '/users/employees') return respond(200, single([]))

    // Admin
    if (path === '/admin/overview') return respond(200, single(adminOverview))
    if (path === '/admin/users') return respond(200, paginated([buyer, seller, admin]))
    if (path === '/admin/revenue') return respond(200, single(adminRevenue))

    // Fallback
    return respond(200, paginated([]))
  })
}

async function newContext(browser, user, viewport, deviceScaleFactor) {
  const context = await browser.newContext({ viewport, deviceScaleFactor })
  if (user) {
    await context.addInitScript(() => localStorage.setItem('authToken', 'mock-token'))
  }
  const page = await context.newPage()
  await mockApi(page, user)
  return { context, page }
}

async function shoot(page, route, file, { fullPage = false } = {}) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(OUT_DIR, file), fullPage })
  console.log(`✓ ${file}`)
}

/* ─────────────────────────── Main ─────────────────────────── */

const browser = await launchBrowser()
const desktop = { width: 1280, height: 900 }

try {
  // 1. Public / buyer storefront (no auth)
  {
    const { context, page } = await newContext(browser, null, desktop, 2)
    await shoot(page, '/', '01-home.png', { fullPage: true })
    await shoot(page, '/products', '02-products.png')
    await shoot(page, '/products/p1', '03-product-detail.png')
    await shoot(page, '/login', '04-login.png')
    await shoot(page, '/signup', '05-signup.png')
    await context.close()
  }

  // 2. Authenticated buyer — cart with items
  {
    const { context, page } = await newContext(browser, buyer, desktop, 2)
    await shoot(page, '/cart', '06-cart.png')
    await context.close()
  }

  // 3. Seller dashboard
  {
    const { context, page } = await newContext(browser, seller, desktop, 2)
    await shoot(page, '/seller/shop', '07-seller-dashboard.png', { fullPage: true })
    await context.close()
  }

  // 4. Admin dashboard
  {
    const { context, page } = await newContext(browser, admin, desktop, 2)
    await shoot(page, '/admin', '08-admin-dashboard.png', { fullPage: true })
    await context.close()
  }

  // 5. Mobile home
  {
    const { context, page } = await newContext(browser, null, { width: 390, height: 844 }, 2)
    await shoot(page, '/', '09-home-mobile.png')
    await context.close()
  }
} finally {
  await browser.close()
}

console.log(`\nDone. Screenshots written to ${OUT_DIR}`)
