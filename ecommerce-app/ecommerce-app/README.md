# Fashion & Apparel E-Commerce Platform

A full-stack e-commerce web application built as coursework, implementing the requirements, logic design, and system design documents produced earlier: variant-based product catalog, cart, checkout, order tracking, verified-purchase reviews, and an admin dashboard.

> **Note on "executable":** a web application (Node.js backend + browser frontend) doesn't compile into a native `.exe`/`.app` file — that's not how the technology works. What you run instead is this source code, started with two short commands (below). This is the standard, correct way to deliver a MERN-style project, and is exactly what your coursework grader will expect to see and run.

---

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT authentication, bcrypt password hashing
- **Frontend:** React 18 (loaded via CDN, no build step required), React Router
- **Payments:** Mock/test-mode payment simulation (no real transactions — see `services/order.service.js`)

This matches the MERN stack and system design (front-end design, logic design, back-end design, database schema) developed earlier in this project.

---

## Quickest Way to Run It

Once you've done the one-time setup below (install Node.js, install MongoDB or get an Atlas URI, run `npm install` + `npm run seed` once in `backend/`), you can start the whole app with **one double-click**:

- **Windows:** double-click `start.bat`
- **Mac/Linux:** run `./start.sh` (or double-click it if your file manager is set to run `.sh` files)

Either one starts the backend API, starts the frontend server, and opens your browser automatically. This is the closest equivalent to an "executable" that a Node.js/React web app has — there's no `.exe` to hand you because this technology runs as a server process, not a compiled binary, but the launcher gets you from zero to a running app in one action after the first-time setup.

---

## Prerequisites

You need the following installed on your machine:
1. **Node.js** v18 or later — https://nodejs.org
2. **MongoDB** running locally, OR a free **MongoDB Atlas** cluster (cloud, no local install needed) — https://www.mongodb.com/cloud/atlas/register

---

## Setup & Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGODB_URI` — your local MongoDB connection string (default `mongodb://127.0.0.1:27017/fashion_ecommerce` works if you have MongoDB running locally) or your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string

Seed the database with demo products, an admin account, and a customer account:

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API will run at **http://localhost:5000**. Visit http://localhost:5000/api/health to confirm it's running.

### 2. Frontend

The frontend needs no build step or npm install — it's plain HTML/CSS/JS using React via CDN. Just serve the folder as static files (opening `index.html` directly also works in most browsers, but a local server avoids some browser restrictions):

```bash
cd frontend
npx serve .
```

(or use Python: `python3 -m http.server 5173`, or the VS Code "Live Server" extension)

Then open the printed URL (e.g. **http://localhost:3000** or **http://localhost:5173**) in your browser.

> The frontend is hardcoded to call the API at `http://localhost:5000/api` — see `frontend/config.js` if you need to change the backend port/URL.

---

## Global-Standard Features Added

This build implements, at coursework scope, the global e-commerce standards defined in the accompanying **`global-standards-compliance.md`** report:

| Area | Where it lives |
|---|---|
| Terms & Conditions, Return/Refund Policy, Privacy Policy | `frontend/pages.js` — `/terms`, `/return-policy`, `/privacy`, linked in the footer and at registration |
| N-tier architecture | Already structured as Presentation (React) → API (routes/controllers) → Business Logic (services) → Data Access (Mongoose models) — see `backend/src` |
| WCAG 2.2 accessibility | Skip-to-content link, visible focus states, 24×24px minimum touch targets, `label`/`htmlFor` pairing, `aria-live`/`role="status"` messaging — see `frontend/styles.css` and form markup in `pages.js` |
| Global security standard | `helmet` security headers (HSTS, CSP, X-Frame-Options), restricted CORS origin, rate limiting on login/register/checkout — see `backend/src/app.js` and `middleware/rateLimiters.js` |
| NDPA (2023) & GDPR | Explicit unticked consent checkbox at registration; "Download My Data" (right to access) and "Delete My Account" (right to erasure) on the `/account` page — see `backend/src/services/auth.service.js` |
| PCI-DSS | No card data is ever stored by this platform — payment uses a tokenized mock flow (`services/order.service.js`); in production this is replaced by a certified processor (Stripe/Paystack/Flutterwave) |
| 3-D Secure 2 | Simulated risk-based step-up challenge on checkout for orders ≥ $50 (demo OTP: `123456`) — see `evaluate3DSRisk()` in `services/order.service.js` and the verification modal in `frontend/pages.js` |
| TLS/SSL | Enforced at the hosting layer in production (HTTPS redirect + HSTS header); see `global-standards-compliance.md` Section 10 for deployment guidance |
| Nielsen's 10 heuristics | Full evaluation table in `global-standards-compliance.md` Section 11 |

> **Honest scope note:** this is a coursework-stage implementation of these principles, not a certified compliance program. A real deployment would still need a PCI-DSS Level 1 certified payment processor, a live 3DS2 integration via that processor, a formal DPIA, and a named Data Protection Officer — all called out explicitly in the compliance report rather than glossed over.

---

## Demo Accounts (created by `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Customer | `customer@example.com` | `Customer123!` |

The customer account already has one **delivered** order and one review seeded, so you can immediately test the "leave a review" flow (only allowed after delivery) without needing to complete a full order first.

---

## What to Try

1. **As a customer:** browse `/#/products`, filter by category, open a product, pick a size/color, add to cart, check out (mock payment — no card required), then track the order status.
2. **As an admin:** log in as `admin@example.com`, go to Admin → Orders, and move the demo order forward through pending → confirmed → shipped → delivered — watch the stock-alert and order-status logic from the Logic Design document in action.
3. **Stock guard:** try adding more of a low-stock variant to the cart than is available — the system rejects it, exactly as specified in the requirements (FR9) and logic design (BR1).

---

## Project Structure

```
ecommerce-app/
├── backend/            → Express API (see backend/README below inline in this file's Setup section)
│   ├── src/
│   │   ├── config/      → DB connection
│   │   ├── models/      → Mongoose schemas (User, Product, Cart, Order, Review)
│   │   ├── middleware/  → auth, authorization, error handling
│   │   ├── routes/      → Express route definitions
│   │   ├── controllers/ → thin request/response layer
│   │   └── services/    → business logic (checkout, stock, reviews — matches Logic Design doc)
│   └── seed/            → demo data seeder
└── frontend/
    ├── index.html
    ├── styles.css        → design system (colors, type, spacing — matches Front-End Design doc)
    ├── config.js, api.js → API client
    ├── context.js        → auth state
    ├── components.js     → shared UI (Navbar, ProductCard, etc.)
    ├── pages.js           → customer-facing pages
    ├── admin.js           → admin dashboard/products/orders
    └── app.js             → routing & app entry point
```

---

## Verification Performed

Before packaging, every backend JS file was checked with `node --check` (syntax) and the full Express app was required end-to-end to confirm no missing modules or require-time errors. Every frontend JSX file was validated with Babel's parser, and the combined frontend scope was checked with ESLint's `no-undef` rule to confirm no missing references across files. **Full end-to-end runtime testing against a live MongoDB could not be completed in this sandboxed environment** (the sandbox's network allowlist blocks the MongoDB binary download used by testing tools), so please run the "What to Try" steps above after setup to confirm everything behaves as expected on your machine — and let me know if you hit any errors so they can be fixed.
