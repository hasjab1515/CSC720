# Statement of the Problem

## Fashion & Apparel E-Commerce Platform

---

## 1. Background

Online shopping has become the dominant way consumers purchase clothing and accessories, with the global fashion e-commerce market valued in the hundreds of billions of dollars and continuing to grow year over year. Despite this growth, many existing platforms — particularly small-scale or student-built systems — fail to properly handle the specific complexities of fashion retail, such as size and color variants, stock accuracy at the variant level, and trustworthy customer feedback.

## 2. Statement of the Problem

Many e-commerce systems treat products as single, uniform entities, ignoring the fact that a single fashion item (e.g., a T-shirt) may exist in multiple sizes and colors, each with its own stock level. This leads to several recurring problems for both customers and administrators:

1. **Inaccurate stock representation** — customers can add out-of-stock size/color combinations to their cart because inventory is tracked at the product level rather than the variant level.
2. **Poor purchase confidence** — customers lack reliable, purchase-verified reviews to judge fit, quality, and true-to-size accuracy before buying.
3. **Limited order transparency** — customers often cannot track the real-time status of their order from placement to delivery, leading to uncertainty and increased support inquiries.
4. **Inefficient inventory management for administrators** — without variant-level tracking, sellers struggle to know exactly what is in stock, leading to overselling or delayed order fulfillment.

There is therefore a need for an e-commerce platform specifically designed around fashion retail's variant-based structure, with accurate inventory tracking, verified reviews, and transparent order management.

## 3. Objectives

The proposed system aims to address the above problems by:

- Designing a data model that tracks inventory at the **size/color variant level**, not just the product level.
- Enabling customers to leave **verified-purchase reviews** to improve trust and purchase confidence.
- Providing **real-time order status tracking** from checkout through delivery.
- Giving administrators a **centralized dashboard** to manage products, variants, stock levels, and orders efficiently.

## 4. Scope

This project is limited to a single-vendor fashion e-commerce platform covering:
- Customer-facing storefront (browsing, filtering, cart, checkout, reviews, order tracking)
- Administrator dashboard (product/variant/stock management, order management)
- Mock payment processing (test-mode integration, not live transactions)

It does not cover multi-vendor marketplace functionality, though this is identified as a potential future extension.

## 5. Significance of the Study

This project demonstrates the practical application of full-stack development principles — relational/document data modeling, RESTful API design, state management, and user-centered interface design — within a realistic, high-relevance commercial domain. The resulting system serves both as an academic deliverable and as a portfolio-ready demonstration of solving a genuine e-commerce data modeling challenge.
