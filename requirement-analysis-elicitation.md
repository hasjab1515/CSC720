# Requirement Analysis and Elicitation

## Fashion & Apparel E-Commerce Platform

---

## 1. Introduction

This document presents the requirement analysis for the Fashion & Apparel E-Commerce Platform. It describes the elicitation techniques used to gather requirements, and defines the functional, non-functional, and system requirements that will guide design and development.

---

## 2. Requirement Elicitation

Requirement elicitation is the process of identifying and gathering the needs of stakeholders (customers, administrators, and course grading criteria) before design begins. The following techniques were used:

| Technique | How it was applied |
|---|---|
| **Stakeholder analysis** | Identified three stakeholder groups: customers (buyers), administrators (sellers/operators), and the course instructor (grading criteria as an implicit stakeholder). |
| **Competitor/document analysis** | Reviewed existing fashion e-commerce platforms (ASOS, Zalando, SHEIN) to identify standard expected features and common UX patterns. |
| **Brainstorming** | Generated an initial feature list during the idea and validation analysis phase, later refined into MVP vs. stretch features. |
| **Use-case walkthroughs** | Mentally walked through key user journeys (browse → filter → add to cart → checkout → track order → leave review) to surface requirements not obvious from a simple feature list. |
| **Feasibility review** | Cross-checked candidate requirements against the feasibility study to remove anything unrealistic for the coursework timeline. |

### Stakeholders and Their Needs

| Stakeholder | Primary Need |
|---|---|
| Customer | Easily find, evaluate, and purchase correctly-sized fashion items with visibility into order status |
| Administrator | Manage product catalog, stock per variant, and orders efficiently |
| Instructor/grader | Evidence of full-stack feature completeness, sound data modeling, and working end-to-end flows |

---

## 3. Functional Requirements

Functional requirements define what the system must **do**.

### 3.1 Authentication & User Management
- FR1: The system shall allow users to register with name, email, and password.
- FR2: The system shall allow users to log in and log out securely.
- FR3: The system shall allow users to manage their profile and saved addresses.
- FR4: The system shall support two roles: customer and admin, with role-based access control.

### 3.2 Product Catalog
- FR5: The system shall display products organized by category (e.g., Men, Women, Kids, Shoes).
- FR6: The system shall allow each product to have multiple variants (size, color), each with its own stock count.
- FR7: The system shall allow customers to filter products by category, price range, size, and color.
- FR8: The system shall allow customers to search products by name or keyword.
- FR9: The system shall prevent customers from adding out-of-stock variants to the cart.

### 3.3 Cart & Checkout
- FR10: The system shall allow customers to add, update, and remove items in a shopping cart.
- FR11: The system shall calculate subtotal, tax, shipping, and total at checkout.
- FR12: The system shall allow customers to enter/select a shipping address at checkout.
- FR13: The system shall process payments through a test-mode payment gateway (e.g., Stripe).
- FR14: The system shall create an order record upon successful payment.

### 3.4 Order Management & Tracking
- FR15: The system shall allow customers to view their order history.
- FR16: The system shall display real-time order status (pending, confirmed, shipped, delivered, cancelled).
- FR17: The system shall allow admins to update order status.

### 3.5 Reviews & Ratings
- FR18: The system shall allow customers who purchased a product to leave a rating and written review.
- FR19: The system shall mark reviews as "verified purchase" when linked to a completed order.
- FR20: The system shall display average rating and review count on each product.

### 3.6 Admin Dashboard
- FR21: The system shall allow admins to create, update, and delete products and their variants.
- FR22: The system shall allow admins to view and update stock levels per variant.
- FR23: The system shall allow admins to view all orders and update their status.
- FR24: The system shall display basic sales analytics (e.g., total orders, revenue, low-stock alerts) to admins.

---

## 4. Non-Functional Requirements

Non-functional requirements define how the system should **behave** — quality attributes rather than specific features.

| Category | Requirement |
|---|---|
| **Performance** | NFR1: Product listing pages shall load within 2 seconds under normal conditions with up to 100 products. |
| **Usability** | NFR2: The interface shall be usable on both desktop and mobile screen sizes (responsive design). |
| **Security** | NFR3: Passwords shall be hashed (e.g., bcrypt) and never stored in plaintext. |
| **Security** | NFR4: Admin-only routes shall be protected against access by non-admin users at the API level, not just hidden in the UI. |
| **Reliability** | NFR5: The system shall prevent overselling by validating stock availability at the point of order confirmation, not just at add-to-cart. |
| **Data Integrity** | NFR6: Order records shall store a snapshot of product details (name, price, variant) so historical orders remain accurate even if the product is later changed or deleted. |
| **Scalability** | NFR7: The database schema shall support adding new categories or variant attributes (e.g., material) without requiring structural redesign. |
| **Maintainability** | NFR8: The codebase shall follow a consistent folder structure (MVC or feature-based) to support readability and grading review. |
| **Availability** | NFR9: The deployed application shall remain accessible via a public URL for demonstration/grading purposes. |
| **Compliance** | NFR10: The system shall avoid processing real payment card data, using test-mode payment integration only. |

---

## 5. System Requirements

System requirements define the technical environment needed to build, run, and deploy the platform.

### 5.1 Software Requirements

| Component | Requirement |
|---|---|
| Frontend | React.js (with React Router, Context API or Redux for state management) |
| Backend | Node.js with Express.js |
| Database | MongoDB (MongoDB Atlas for cloud hosting) |
| Authentication | JSON Web Tokens (JWT) |
| Payment Gateway | Stripe API (test mode) |
| Image Handling | Cloudinary or equivalent (or local storage for coursework scope) |
| Version Control | Git and GitHub |
| Deployment | Vercel/Netlify (frontend), Render/Railway (backend) — free tiers sufficient |

### 5.2 Hardware Requirements (Development Environment)

| Component | Minimum Specification |
|---|---|
| Processor | Dual-core 2.0 GHz or higher |
| RAM | 8 GB minimum (16 GB recommended for smooth local development) |
| Storage | 5 GB free disk space (for dependencies, node_modules, local DB tools) |
| Internet | Stable connection (required for MongoDB Atlas, npm packages, Stripe API, deployment) |

### 5.3 End-User Requirements (Runtime)

| Component | Requirement |
|---|---|
| Device | Any device with a modern web browser (desktop, tablet, or mobile) |
| Browser | Latest version of Chrome, Firefox, Edge, or Safari |
| Internet | Required — no offline functionality planned |

---

## 6. Requirement Prioritization (MoSCoW)

| Priority | Requirements |
|---|---|
| **Must have** | FR1–FR17 (auth, catalog, cart, checkout, orders), NFR1, NFR3–NFR6 |
| **Should have** | FR18–FR20 (reviews), FR21–FR23 (core admin functions), NFR2, NFR7–NFR9 |
| **Could have** | FR24 (analytics dashboard), wishlist, coupon codes |
| **Won't have (this iteration)** | Multi-vendor support, live payment processing, mobile native app |

---

## 7. Conclusion

The elicited requirements reflect both standard fashion e-commerce functionality and the specific data-modeling challenges (variant-level stock, verified reviews, order snapshotting) that differentiate this project. Prioritization ensures the MVP (Must/Should requirements) is achievable within the coursework timeline, with additional features layered in only as time permits.
