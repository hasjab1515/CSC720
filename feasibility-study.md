# Feasibility Study

## Fashion & Apparel E-Commerce Platform

---

## 1. Introduction

This feasibility study evaluates whether the proposed Fashion & Apparel E-Commerce Platform is viable to design, build, and deliver within the constraints of the coursework (time, technical skill, and resources available). It examines technical, operational, economic, schedule, and legal feasibility, followed by SMART objectives and a SWOT analysis.

---

## 2. Technical Feasibility

**Question:** Can the system be built with the tools, skills, and technology available?

- **Stack:** MERN (MongoDB, Express.js, React, Node.js) — well-documented, widely supported, and suited to the project's data structure (embedded product variants, referenced orders/users).
- **Core technical challenges:**
  - Modeling size/color variants with accurate per-variant stock (moderate complexity, solvable with embedded documents).
  - Preventing overselling during concurrent checkouts (solvable with atomic stock-decrement operations).
  - Order snapshotting so historical orders remain accurate even if product data changes later.
- **Supporting tools:** Stripe (test mode) for payment simulation, Cloudinary/local storage for product images, JWT for authentication.

**Verdict: Technically feasible.** All required features map to well-established patterns; no unsolved technical problems.

---

## 3. Operational Feasibility

**Question:** Will the system function well for its intended users (customers and admin) once built?

- Customers need only standard e-commerce actions (browse, filter, cart, checkout, review, track order) — familiar UX patterns reduce usability risk.
- Admin functions (manage products/variants/stock, view/update orders) are standard CRUD operations, achievable with a dashboard UI.
- No specialized hardware or unusual operating environment is required — a standard web browser is sufficient for both customer and admin use.

**Verdict: Operationally feasible.** The system fits standard e-commerce workflows with no unusual operational demands.

---

## 4. Economic Feasibility

**Question:** Is the project achievable within available resources (money, time, tools)?

- **Development cost:** Effectively $0 beyond time — MERN stack, MongoDB Atlas free tier, Stripe test mode, and free-tier hosting (e.g., Render/Vercel) are all available at no cost for coursework scale.
- **Data/assets:** Free/open fashion product datasets and stock images are readily available for seeding the catalog.
- **Time cost:** The main "cost" is developer time; scoped correctly (MVP first, stretch features second), this is manageable within a semester timeline.

**Verdict: Economically feasible.** No paid infrastructure is required to complete or demonstrate the project.

---

## 5. Schedule Feasibility

**Question:** Can the project realistically be completed within the coursework deadline?

| Phase | Estimated Duration | Deliverable |
|---|---|---|
| Planning & design (ERD, wireframes) | Week 1–2 | Schema, UI mockups |
| Backend MVP (auth, products, cart, orders) | Week 3–5 | Working API |
| Frontend MVP (catalog, cart, checkout) | Week 5–7 | Working UI connected to API |
| Reviews, order tracking, admin panel | Week 8–9 | Full feature set |
| Stretch features (wishlist, coupons, analytics) | Week 10 (if time allows) | Optional additions |
| Testing, polish, documentation | Week 11–12 | Final submission |

**Verdict: Feasible**, provided stretch features remain optional and MVP is prioritized early.

---

## 6. Legal / Compliance Feasibility

- No real payment data is processed (Stripe test mode), avoiding PCI-DSS compliance concerns for coursework purposes.
- User data (name, email, address) should still be handled following basic good practice (password hashing, no plaintext storage) even though it's an academic project — this can be noted in the report as a security consideration.
- Product images/data used for seeding should be sourced from free/open datasets to avoid copyright issues in a submitted academic project.

**Verdict: Feasible**, with basic data-handling practices in place.

---

## 7. Overall Feasibility Conclusion

All five feasibility dimensions — technical, operational, economic, schedule, and legal — support proceeding with the project as scoped. The main risk is **schedule discipline**, not technical difficulty; success depends on locking the MVP scope early and treating advanced features as optional additions.

---

## 8. SMART Objectives

| Criterion | Objective |
|---|---|
| **Specific** | Build a fashion e-commerce platform with user authentication, a variant-based product catalog, cart/checkout, order tracking, verified-purchase reviews, and an admin dashboard. |
| **Measurable** | Success is measured by: all 6 core features fully functional, at least 15 seeded products with variants, and a complete checkout-to-order-tracking flow demonstrable end-to-end. |
| **Achievable** | Uses well-documented technologies (MERN, Stripe test mode) and design patterns already validated in the feasibility study above. |
| **Relevant** | Directly satisfies the coursework's "full-stack feature completeness" grading focus and reflects real-world fashion e-commerce data modeling challenges. |
| **Time-bound** | MVP complete by Week 7; full feature set (reviews, tracking, admin panel) complete by Week 9; stretch features and polish by final submission deadline (Week 12). |

---

## 9. SWOT Analysis

| Strengths | Weaknesses |
|---|---|
| Well-understood domain with abundant reference data/images | Not a novel real-world business idea |
| Free, well-documented tech stack (no cost barrier) | Variant/inventory logic adds non-trivial complexity vs. a basic catalog |
| Naturally demonstrates full-stack depth (auth, DB design, admin panel, payments) | Requires disciplined scope control to avoid feature creep |
| Strong portfolio value — recognizable, demo-friendly project | Single-developer timeline risk if scope isn't locked early |

| Opportunities | Threats |
|---|---|
| Can extend to multi-vendor marketplace as a future/stretch feature | Feature creep — fashion e-commerce is easy to over-scope |
| Reusable as a portfolio piece for job/internship applications | Grading risk if differentiation (variant accuracy, verified reviews) isn't clearly argued in documentation |
| Clear path to add AI-driven features later (recommendations, size prediction) | Time lost to non-core polish (styling) at the expense of core features |

---

## 10. Recommendation

The project is **feasible across all evaluated dimensions** and is recommended to proceed as scoped, with the MVP feature set treated as the non-negotiable deliverable and all additional features (wishlist, coupons, multi-vendor extension, analytics dashboard) treated as time-permitting stretch goals.
