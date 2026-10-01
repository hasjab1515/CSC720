# System Design: Front-End Design

## Fashion & Apparel E-Commerce Platform

---

## 1. Introduction

This document defines the front-end design of the Fashion & Apparel E-Commerce Platform, covering site structure, page-by-page layout, navigation flow, component architecture, and the visual design system. It translates the functional requirements into a concrete, buildable React front-end.

---

## 2. Design Goals

- **Clarity over density** — customers should never be confused about size, stock, or price.
- **Mobile-first** — most fashion shoppers browse on mobile; layouts are designed for small screens first, then scaled up.
- **Fast task completion** — minimize clicks from landing → product → cart → checkout.
- **Trust signals visible early** — ratings, verified-review badges, and stock status shown at a glance, not buried.

---

## 3. Site Map

```
Home
├── Product Listing (by category)
│   └── Product Detail
│       └── Reviews (section within product page)
├── Search Results
├── Cart
├── Checkout
│   └── Order Confirmation
├── Account
│   ├── Login / Register
│   ├── Profile & Addresses
│   ├── Order History
│   │   └── Order Detail / Tracking
│   └── Wishlist (stretch)
└── Admin (role-protected)
    ├── Dashboard (analytics overview)
    ├── Products
    │   └── Add/Edit Product & Variants
    ├── Orders
    │   └── Order Detail (update status)
    └── Stock Alerts
```

---

## 4. Navigation Flow

**Primary customer flow:**
`Home → Category/Search → Product Listing → Product Detail (select variant) → Add to Cart → Cart → Checkout → Order Confirmation → Order Tracking`

**Secondary flow (post-purchase):**
`Account → Order History → Order Detail → Leave Review`

**Admin flow:**
`Admin Login → Dashboard → Products (manage stock) / Orders (update status)`

---

## 5. Page-by-Page Design

### 5.1 Home Page
- Hero banner (promotional/seasonal)
- Featured categories (grid of category tiles: Men, Women, Kids, Shoes, Accessories)
- Trending/best-selling products carousel
- Newsletter signup (optional, low priority)

**Layout:** single column on mobile; hero + 3–4 column grid on desktop.

### 5.2 Product Listing Page
- Filter sidebar (desktop) / filter drawer (mobile): category, price range, size, color
- Sort dropdown (price low-high, newest, rating)
- Product grid: image, name, price, star rating, quick "view" on hover (desktop)
- Pagination or infinite scroll

**Layout:** 2-column grid on mobile, 3–4 column grid on desktop; filters collapse into a slide-out drawer below tablet breakpoint.

### 5.3 Product Detail Page
- Image gallery (main image + thumbnails)
- Product name, price, average rating + review count
- Variant selector: size buttons and color swatches (disabled/greyed if that variant is out of stock)
- Stock indicator ("Only 3 left" / "In stock" / "Out of stock")
- Add to Cart button (disabled until a valid variant is selected)
- Description & material details (expandable section)
- Reviews section: rating breakdown, individual reviews with "Verified Purchase" badge, review photos if present

**Layout:** two-column on desktop (gallery left, info right); stacked single column on mobile.

### 5.4 Cart Page
- List of cart items: thumbnail, name, selected size/color, quantity stepper, remove button
- Price breakdown: subtotal, estimated shipping, total
- "Proceed to Checkout" button
- Empty-cart state with a call-to-action back to shopping

### 5.5 Checkout Page
- Step indicator: Shipping → Payment → Review
- Shipping address form (or select saved address)
- Payment form (Stripe Elements, test mode)
- Order summary sidebar (sticky on desktop, collapsible on mobile)
- "Place Order" button with loading state during payment processing

### 5.6 Order Confirmation Page
- Success message with order number
- Summary of items ordered
- Link to track order

### 5.7 Account / Order History
- Tab or side-nav: Profile, Addresses, Order History, (Wishlist)
- Order History: list of past orders with status badge, date, total
- Order Detail: itemized order, status timeline (visual stepper: Placed → Confirmed → Shipped → Delivered), "Leave a Review" button per item (only after delivery)

### 5.8 Admin Dashboard
- Summary cards: total orders, revenue, low-stock items count
- Recent orders table
- Quick links to Products and Orders management

### 5.9 Admin – Product Management
- Product table: name, category, variant count, total stock, status (active/inactive)
- Add/Edit Product form: name, description, category, images, and a repeatable variant sub-form (size, color, SKU, stock, price override)

### 5.10 Admin – Order Management
- Order table: order ID, customer, date, status, total
- Order Detail: item breakdown, status dropdown to update (pending → confirmed → shipped → delivered)

---

## 6. Component Architecture (React)

```
src/
├── components/
│   ├── layout/          → Navbar, Footer, MobileFilterDrawer, AdminSidebar
│   ├── product/         → ProductCard, ProductGrid, VariantSelector, StockBadge
│   ├── cart/            → CartItem, CartSummary
│   ├── checkout/        → ShippingForm, PaymentForm, OrderSummary
│   ├── reviews/         → ReviewList, ReviewForm, RatingStars
│   ├── orders/          → OrderStatusTimeline, OrderCard
│   ├── admin/           → ProductForm, VariantFieldArray, AdminTable, StatCard
│   └── common/          → Button, Input, Modal, Loader, Toast
├── pages/                → one component per route (HomePage, ProductListPage, ProductDetailPage, CartPage, CheckoutPage, AccountPage, AdminDashboardPage, etc.)
├── context/              → AuthContext, CartContext
├── hooks/                → useAuth, useCart, useFetch
├── services/              → api.js (Axios instance), productService, orderService, authService
└── utils/                 → formatCurrency, validators
```

**State management approach:** React Context for auth and cart (global, low-frequency updates); local component state or React Query/SWR for server data (products, orders) to handle caching and loading/error states cleanly.

---

## 7. Design System

### 7.1 Color Palette
| Role | Color | Usage |
|---|---|---|
| Primary | Deep charcoal (#1F2023) | Headers, primary buttons, nav |
| Accent | Warm terracotta (#C96F4A) | CTAs, sale badges, highlights |
| Neutral background | Off-white (#F7F5F2) | Page background |
| Neutral surface | White (#FFFFFF) | Cards, product tiles |
| Success | Muted green (#4A7C59) | In-stock, delivered status |
| Warning | Amber (#D8A23B) | Low-stock alerts |
| Error | Muted red (#B3453A) | Out-of-stock, form errors |

*Rationale: a neutral, editorial palette (charcoal/off-white/terracotta) reads as "fashion retail" rather than generic SaaS blue, while staying easy to implement with plain CSS variables.*

### 7.2 Typography
- **Headings:** a clean serif or high-contrast sans-serif (e.g., "Playfair Display" for hero/headings) to give an editorial, fashion-catalog feel.
- **Body/UI text:** a neutral sans-serif (e.g., "Inter" or "Work Sans") for readability in product lists, forms, and tables.
- **Scale:** modest type scale (e.g., 14/16/20/28/36px) — avoid oversized decorative type on functional pages (cart, checkout, admin).

### 7.3 Spacing & Grid
- 8px base spacing unit (multiples of 8 for margins/padding).
- 12-column grid on desktop, collapsing to a single column or 2-column grid on mobile.
- Breakpoints: mobile <640px, tablet 640–1024px, desktop >1024px.

### 7.4 Component Style Notes
- Buttons: solid accent color for primary actions (Add to Cart, Place Order), outline style for secondary actions (Continue Shopping, Cancel).
- Stock badges: small pill-shaped labels, color-coded (green/amber/red) per the palette above.
- Reviews: star rating rendered as filled/outline icons, with "Verified Purchase" as a small check-badge label next to the reviewer name.

---

## 8. Responsive Strategy

| Breakpoint | Key adaptations |
|---|---|
| Mobile (<640px) | Single-column layouts, filters in a slide-out drawer, sticky "Add to Cart" bar on product detail, bottom nav for cart/account (optional) |
| Tablet (640–1024px) | 2-column product grid, filters as a collapsible sidebar |
| Desktop (>1024px) | Full sidebar filters, 3–4 column product grid, sticky order summary at checkout |

---

## 9. Accessibility Considerations

- All interactive elements (variant buttons, filters, forms) reachable and operable via keyboard.
- Sufficient color contrast between text and background, especially for status badges.
- Alt text required on all product images.
- Form errors announced clearly (not color-only — paired with icon/text).

---

## 10. Conclusion

This front-end design translates the platform's functional requirements into a concrete page structure, component hierarchy, and visual system. The mobile-first, component-based approach aligns with the MERN stack chosen earlier and gives a clear implementation roadmap: shared UI components first, then page assembly per the site map above.
