# System Design: Back-End Design

## Fashion & Apparel E-Commerce Platform

---

## 1. Introduction

This document defines the back-end design of the platform — the API architecture, folder structure, middleware pipeline, and endpoint specification that implement the business logic described in the Logic Design document and serve the data modeled in the database schema. The back-end is built on **Node.js with Express.js**, following a layered (routes → controllers → services → models) architecture for testability and separation of concerns.

---

## 2. Architectural Overview

The back-end follows a **layered REST API architecture**:

```
Client (React)
     │  HTTP requests (JSON)
     ▼
┌─────────────────────────────────────────┐
│                Express App                │
│  ┌───────────────────────────────────┐  │
│  │  Middleware (auth, validation,     │  │
│  │  error handling, CORS, logging)    │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │  Routes  →  Controllers            │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │  Services (business logic)         │  │
│  └───────────────┬───────────────────┘  │
│  ┌───────────────▼───────────────────┐  │
│  │  Models (Mongoose schemas)         │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                    ▼
              MongoDB Atlas
```

**Why this layering:** Controllers stay thin (parse request, call service, format response). Services hold the actual business logic from the Logic Design document (stock validation, order state transitions, review verification) so it can be unit-tested independently of Express/HTTP concerns.

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                 → MongoDB connection setup
│   │   └── env.js                → environment variable loader/validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   └── Coupon.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   └── admin.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── cart.service.js
│   │   ├── order.service.js       → checkout, stock decrement, status transitions
│   │   ├── review.service.js
│   │   └── payment.service.js     → Stripe integration wrapper
│   ├── middleware/
│   │   ├── authenticate.js        → verifies JWT
│   │   ├── authorize.js           → role-based access control
│   │   ├── validateRequest.js     → schema-based input validation
│   │   └── errorHandler.js        → centralized error formatting
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   └── logger.js
│   ├── app.js                     → Express app setup (middleware registration)
│   └── server.js                  → entry point, starts the HTTP server
├── tests/
│   ├── unit/                      → service-layer tests
│   └── integration/                → route/endpoint tests
├── .env.example
├── package.json
└── README.md
```

---

## 4. Middleware Pipeline

Applied in this order for every incoming request:

1. **CORS** — restrict allowed origins to the deployed frontend URL.
2. **Body parser** — `express.json()` for parsing JSON request bodies.
3. **Request logger** — logs method, path, and response time (e.g., via `morgan`).
4. **Route-specific middleware:**
   - `authenticate` — verifies JWT, attaches `req.user`, rejects with 401 if missing/invalid.
   - `authorize("admin")` — rejects with 403 if `req.user.role` isn't sufficient (applied only on admin routes).
   - `validateRequest(schema)` — validates request body/params/query against a schema (e.g., Joi/Zod) before it reaches the controller.
5. **Controller execution** — wrapped in `asyncHandler` so thrown errors are automatically forwarded to the error handler instead of crashing the process.
6. **Centralized error handler** — final middleware; converts thrown `ApiError`s (and unexpected errors) into a consistent JSON error response with the correct HTTP status code.

---

## 5. API Endpoint Specification

### 5.1 Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new customer account |
| POST | `/login` | Public | Authenticate and receive a JWT |
| GET | `/me` | Authenticated | Get current user's profile |
| PUT | `/me` | Authenticated | Update profile / addresses |

### 5.2 Product Routes (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | List products (supports `category`, `minPrice`, `maxPrice`, `size`, `color`, `search`, `sort`, `page` query params) |
| GET | `/:id` | Public | Get single product with variants and review summary |
| POST | `/` | Admin | Create a new product with variants |
| PUT | `/:id` | Admin | Update product details |
| PUT | `/:id/variants/:variantId` | Admin | Update a specific variant (stock, price override) |
| DELETE | `/:id` | Admin | Deactivate/remove a product |

### 5.3 Cart Routes (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | Get current user's cart |
| POST | `/items` | Authenticated | Add item to cart (validates stock) |
| PUT | `/items/:itemId` | Authenticated | Update quantity |
| DELETE | `/items/:itemId` | Authenticated | Remove item from cart |

### 5.4 Order Routes (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/checkout` | Authenticated | Place order from cart (runs full checkout logic) |
| GET | `/` | Authenticated | Get current user's order history |
| GET | `/:id` | Authenticated | Get single order detail/tracking |
| GET | `/admin/all` | Admin | Get all orders (for admin management) |
| PUT | `/admin/:id/status` | Admin | Update order status |

### 5.5 Review Routes (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/product/:productId` | Public | Get reviews for a product |
| POST | `/` | Authenticated | Submit a review (validates verified purchase) |
| DELETE | `/:id` | Owner/Admin | Delete own review, or admin moderation |

### 5.6 Admin Routes (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Summary stats: total orders, revenue, low-stock count |
| GET | `/stock-alerts` | Admin | Low-stock and out-of-stock variant list |

---

## 6. Request/Response Conventions

**Success response shape:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "totalPages": 5 }   // only present when paginated
}
```

**Error response shape:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Only 2 units of this variant are available"
  }
}
```

Using a consistent shape means the frontend can handle all API responses through one shared Axios interceptor rather than special-casing each endpoint.

---

## 7. Security Design

| Concern | Implementation |
|---|---|
| Password storage | bcrypt hashing (never plaintext), salt rounds ≥ 10 |
| Authentication | Stateless JWT, short-lived access token (extendable to refresh tokens as a stretch goal) |
| Authorization | Role check middleware on every admin route, enforced server-side (not just hidden in UI) |
| Input validation | Schema validation middleware on every route accepting a body (rejects malformed/unexpected fields) |
| Injection protection | Mongoose's built-in parameterization protects against NoSQL injection; additionally sanitize query params |
| Rate limiting | Basic rate limiter on `/auth/login` to reduce brute-force risk |
| Secrets management | All credentials (DB URI, JWT secret, Stripe keys) loaded from environment variables, never hardcoded |
| CORS | Restricted to the known frontend origin(s) only |

---

## 8. Payment Integration Design

```
FUNCTION payment.service.charge(paymentToken, amount):
    paymentIntent = stripe.paymentIntents.create({
        amount: amount * 100,   // Stripe uses smallest currency unit
        currency: "usd",
        payment_method: paymentToken,
        confirm: true
    })
    IF paymentIntent.status == "succeeded":
        RETURN { status: "success", paymentIntentId: paymentIntent.id }
    ELSE:
        RETURN { status: "failed", reason: paymentIntent.last_payment_error }
```

Stripe test mode is used throughout — no real financial transactions occur, satisfying the legal/compliance feasibility constraint noted earlier.

---

## 9. Database Connection Design

```
FUNCTION connectDB():
    TRY:
        mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ no longer needs legacy connection flags
        })
        logger.info("MongoDB connected")
    CATCH error:
        logger.error("MongoDB connection failed", error)
        process.exit(1)
```

Connection is established once at server startup (`server.js`), before the Express app begins accepting requests.

---

## 10. Testing Strategy

| Layer | Test type | Example |
|---|---|---|
| Services | Unit tests | `order.service.test.js` — verifies stock-guard logic rejects overselling |
| Routes | Integration tests | `POST /api/orders/checkout` — full flow with a mocked payment gateway |
| Middleware | Unit tests | `authorize.test.js` — confirms 403 returned for non-admin on admin routes |

Mocking the payment gateway in tests avoids hitting the real Stripe test API on every test run.

---

## 11. Deployment Design

| Aspect | Approach |
|---|---|
| Hosting | Render or Railway (free tier sufficient for coursework demo) |
| Environment config | `.env` file locally; environment variables set in hosting dashboard for production |
| Process management | Node process managed by the hosting platform (no need for PM2 at this scale) |
| Logging | Console-based logging (via `logger.js`) sufficient for coursework; captured by hosting platform's log viewer |

---

## 12. Conclusion

The back-end design applies a layered architecture (routes → controllers → services → models) so that the business rules defined in the Logic Design document live in testable service functions rather than being scattered across route handlers. The endpoint specification above maps directly onto the functional requirements (Section 3 of the Requirement Analysis document), and the security design addresses the non-functional requirements around authentication, authorization, and data integrity.
