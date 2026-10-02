# Global Standards, Compliance & Governance Report
## Fashion & Apparel E-Commerce Platform

---

## 1. Terms and Conditions

**Effective Date:** Upon account registration.

### 1.1 Acceptance of Terms
By creating an account or placing an order on this platform, the user agrees to be bound by these Terms and Conditions, the Return & Refund Policy, and the Privacy Policy.

### 1.2 Eligibility
Users must be at least 18 years old, or the age of legal majority in their jurisdiction, to create an account and make purchases. Users under this age may use the platform only with the involvement of a parent or guardian.

### 1.3 Account Responsibilities
- Users are responsible for maintaining the confidentiality of their login credentials.
- Users must provide accurate registration and shipping information.
- The platform reserves the right to suspend accounts used for fraudulent activity.

### 1.4 Product Information
- Product images, descriptions, and colors are presented as accurately as possible, but minor variations (screen rendering, dye lots) may occur.
- Stock levels are managed per size/color variant and are validated at checkout; availability shown at browse time is not a guarantee of availability at purchase time.

### 1.5 Pricing & Payment
- All prices are displayed inclusive of applicable currency and exclusive of tax unless stated otherwise; tax is calculated at checkout.
- Payment is processed through a PCI-DSS-compliant payment channel (see Section 8). The platform does not store full card numbers.

### 1.6 Order Acceptance
An order confirmation does not constitute acceptance of an order — it is an acknowledgment that the order has been received. A contract is formed only once the order is confirmed and payment is verified.

### 1.7 Limitation of Liability
The platform is not liable for indirect, incidental, or consequential damages arising from use of the service, to the maximum extent permitted by applicable law.

### 1.8 Governing Law
These terms are governed by the laws of the jurisdiction in which the platform operator is registered, without prejudice to statutory consumer rights in the user's own country of residence (e.g., EU/UK consumer protection law, Nigerian consumer protection law).

### 1.9 Changes to Terms
The platform may update these terms from time to time. Continued use after changes take effect constitutes acceptance of the revised terms.

---

## 2. Return and Refund Policy

### 2.1 Return Window
Items may be returned within **14 days** of delivery, unworn, unwashed, with original tags attached — consistent with standard EU Consumer Rights Directive practice (14-day right of withdrawal) and widely adopted as global e-commerce best practice.

### 2.2 Non-Returnable Items
- Items marked "Final Sale"
- Pierced jewelry / intimate apparel, for hygiene reasons
- Items without original tags/packaging

### 2.3 Refund Process
1. Customer initiates a return request from Order History → Order Detail.
2. Customer ships the item back (or requests pickup, where available).
3. Once received and inspected, a refund is issued to the original payment method within **5–10 business days**.
4. The customer receives email/status notification at each stage (mirrors the order status timeline already built into the platform).

### 2.4 Exchanges
Size/color exchanges are treated as a return + new order, to keep inventory and variant-stock logic (see Logic Design document) consistent and auditable.

### 2.5 Damaged or Incorrect Items
Items that arrive damaged, defective, or incorrect are eligible for a full refund or replacement at no additional cost, including return shipping.

### 2.6 Refund Method
Refunds are issued to the original payment method only, consistent with PCI-DSS and anti-fraud best practice (refunding to a different card/account is disabled by design).

---

## 3. Theories of E-Commerce Applied to This Platform

| Theory | Application in this platform |
|---|---|
| **Transaction Cost Theory** (Coase/Williamson) | The platform reduces the transaction costs of fashion retail — search costs (filters/search), bargaining costs (fixed pricing), and verification costs (verified-purchase reviews) — making direct online transactions more efficient than traditional retail. |
| **Technology Acceptance Model (TAM)** (Davis, 1989) | Design decisions (clear variant selection, visible stock status, simple checkout) target *perceived ease of use*; accurate sizing and verified reviews target *perceived usefulness* — both are TAM's core predictors of adoption. |
| **Diffusion of Innovation Theory** (Rogers) | Features such as order tracking and verified reviews reduce *perceived risk*, a key barrier to adoption identified by Rogers, encouraging adoption by less risk-tolerant ("majority") online shoppers, not just early adopters. |
| **Trust Theory in E-Commerce** (McKnight et al.) | Trust is built structurally (secure checkout, visible policies, PCI-DSS/3DS2 compliance) and socially (verified-purchase reviews, rating aggregation) — both dimensions identified as necessary for e-commerce trust formation. |
| **Network Effects / Long Tail Theory** (Anderson) | A growing catalog and review base increases value to each new user (more variants, more reviews to reference), characteristic of long-tail retail economics applied to niche fashion sizing. |
| **Service-Dominant Logic** (Vargo & Lusch) | The platform is framed as delivering an ongoing *service* (accurate sizing, order transparency, easy returns) rather than a one-time *good* exchange — reviews and order tracking are value co-created with the customer post-purchase. |

---

## 4. N-Tier Architecture

The platform is explicitly structured as a **4-tier architecture**, separating concerns for maintainability, security, and scalability — a global standard pattern for enterprise and e-commerce systems.

```
┌─────────────────────────────────────────────┐
│ Tier 1: Presentation Layer                    │
│ React frontend (pages, components)            │
│ Responsible for: UI rendering, client-side     │
│ validation, accessibility (WCAG 2.2)           │
└───────────────────┬───────────────────────────┘
                     │ HTTPS/TLS (REST/JSON)
┌───────────────────▼───────────────────────────┐
│ Tier 2: Application / API Layer                │
│ Express routes + controllers                   │
│ Responsible for: request routing, auth,        │
│ input validation, rate limiting, security       │
│ headers                                         │
└───────────────────┬───────────────────────────┘
┌───────────────────▼───────────────────────────┐
│ Tier 3: Business Logic / Service Layer          │
│ Service modules (order, cart, product, review)  │
│ Responsible for: business rules, stock guard,   │
│ order state machine, payment orchestration,     │
│ 3-D Secure step-up logic                        │
└───────────────────┬───────────────────────────┘
┌───────────────────▼───────────────────────────┐
│ Tier 4: Data Access & Persistence Layer         │
│ Mongoose models → MongoDB                       │
│ Responsible for: schema enforcement, queries,   │
│ data integrity, encryption at rest               │
└─────────────────────────────────────────────────┘
```

**Why N-tier matters for this project:** each tier can be scaled, secured, and tested independently. The presentation tier never talks to the database tier directly; every request passes through authentication/authorization and business-rule validation first — this is what prevents, for example, a manipulated client-side request from bypassing stock checks (BR1/BR2 in the Logic Design document) or skipping payment verification.

---

## 5. Accessibility — WCAG 2.2 Compliance

The platform targets **WCAG 2.2 Level AA**, the commonly required global standard for commercial e-commerce sites (referenced by the EU's European Accessibility Act, the US ADA/Section 508 interpretation, and the UK Equality Act).

| WCAG 2.2 Principle | Implementation |
|---|---|
| **Perceivable** | All product images carry descriptive `alt` text; color is never the sole indicator of state (stock badges pair color with text: "Only 3 left", not just a color dot); text maintains a minimum 4.5:1 contrast ratio against backgrounds per the defined color tokens. |
| **Operable** | Full keyboard operability for variant selection, filters, and forms; a "Skip to main content" link is provided; focus states are visibly styled (never `outline: none` without a replacement); **2.4.11/2.4.12 Focus Not Obscured** is respected — no sticky elements cover a focused control; touch targets meet the new WCAG 2.2 **2.5.8 Target Size (Minimum)** of 24×24 CSS pixels (buttons, chips, form controls sized accordingly). |
| **Understandable** | Form labels are explicitly associated with inputs (`<label for>`); error messages are specific and programmatically associated with their field; **3.3.7 Redundant Entry** is respected — checkout reuses a saved address rather than asking for it twice; **3.3.8 Accessible Authentication** is respected — login requires only email/password (no cognitive-function test like a puzzle CAPTCHA). |
| **Robust** | Semantic HTML (`<nav>`, `<main>`, `<header>`, `<footer>`, proper heading hierarchy) is used throughout so assistive technologies can parse structure correctly; ARIA roles/labels are added only where semantic HTML is insufficient (e.g., live region for cart/form success messages via `aria-live="polite"`). |

**Testing approach:** automated checks (axe-core or Lighthouse accessibility audit) combined with manual keyboard-only navigation testing and screen reader spot-checks (NVDA/VoiceOver) are recommended before go-live, and should be documented as part of the coursework submission's testing section.

---

## 6. Global Security Standard (Overview)

The platform follows a defense-in-depth approach aligned with globally recognized security frameworks:

| Layer | Standard / Practice applied |
|---|---|
| Transport | TLS 1.2+ enforced for all traffic (Section 10) |
| Authentication | Password hashing with bcrypt (salted, cost factor ≥10), JWT with short expiry |
| Authorization | Role-based access control enforced server-side on every protected route |
| Input handling | Schema validation on all inputs; Mongoose parameterization prevents NoSQL injection |
| Headers | Security headers set via `helmet` middleware (HSTS, X-Content-Type-Options, X-Frame-Options, Content-Security-Policy) |
| Rate limiting | Login and checkout endpoints rate-limited to reduce brute-force and card-testing (carding) attacks |
| Payment | PCI-DSS-aligned tokenized payment flow (Section 8), 3-D Secure 2 step-up authentication (Section 9) |
| Monitoring | Centralized error logging; failed-login and failed-payment attempts logged for anomaly review |
| Data protection | Encryption at rest for the database (provider-level, e.g. MongoDB Atlas encryption-at-rest), encryption in transit (TLS) |

This reflects widely referenced frameworks such as the **OWASP Top 10** (the platform's design specifically mitigates Broken Access Control, Injection, Identification and Authentication Failures, and Security Misconfiguration — the top-ranked risks) and **ISO/IEC 27001** information-security management principles, applied at a scope appropriate to a coursework-stage system.

---

## 7. NDPA (2023) and GDPR Compliance

The platform is designed to respect both the **Nigeria Data Protection Act, 2023 (NDPA)** and the **EU General Data Protection Regulation (GDPR)**, since both set similar baseline obligations for any platform processing personal data of Nigerian or EU residents respectively.

| Principle (common to NDPA & GDPR) | Implementation |
|---|---|
| **Lawful basis & consent** | Explicit consent checkbox at registration ("I agree to the Terms, Privacy Policy, and processing of my data for order fulfillment"), unticked by default — consent is not bundled or pre-selected. |
| **Purpose limitation** | Personal data (name, email, address) is collected only for account management, order fulfillment, and communication — not reused for unrelated purposes without fresh consent. |
| **Data minimization** | Only fields actually required for shipping/billing are collected; no unnecessary demographic or tracking data is requested at registration. |
| **Right to access** | A "Download My Data" account feature allows users to export their profile, order history, and reviews. |
| **Right to erasure ("right to be forgotten")** | A "Delete My Account" feature allows users to request deletion; personal data is removed/anonymized while order records required for tax/legal retention are pseudonymized (name/email replaced with "Deleted User") rather than fully destroyed, to satisfy retention obligations without retaining unnecessary personal data. |
| **Data breach notification** | Organizational commitment (documented here for coursework purposes) to notify the NDPA-designated authority (the **Nigeria Data Protection Commission**) and/or relevant EU supervisory authority within the regulatory window (72 hours under GDPR) in the event of a qualifying breach. |
| **Data Protection Officer / accountability** | For a production deployment, a named Data Protection Officer (or equivalent accountable contact) should be designated, as both NDPA and GDPR require accountable ownership of data-protection compliance. |
| **Cross-border transfer** | Where hosting infrastructure (e.g., MongoDB Atlas, cloud hosting) is located outside Nigeria/the EU, this is disclosed in the Privacy Policy, consistent with both laws' cross-border data transfer disclosure requirements. |

**Note on scope:** this is a coursework-stage implementation of these principles (consent capture, data export, deletion request) rather than a fully certified compliance program — a real commercial deployment would require a documented Record of Processing Activities (ROPA), a formal Data Protection Impact Assessment (DPIA), and legal review.

---

## 8. PCI-DSS (Payment Card Industry Data Security Standard)

The platform is designed around the core PCI-DSS principle: **minimize the systems that touch raw cardholder data.**

| PCI-DSS Requirement (v4.0 summary) | How this platform addresses it |
|---|---|
| 1–2: Secure network/systems | Firewall-level and hosting-provider network controls (deployment-level responsibility); default credentials never used |
| 3: Protect stored cardholder data | **The platform never stores card numbers, CVV, or full track data at all** — payment is handled via a tokenized flow (mock-mode here; in production this would be Stripe/Paystack/Flutterwave, all PCI-DSS Level 1 certified processors). Only a non-sensitive payment reference/token is stored on the Order record. |
| 4: Encrypt transmission of cardholder data | All payment-related traffic travels over TLS (Section 10); card fields, in a real integration, are captured by the processor's hosted fields/SDK, never touching the platform's own servers (SAQ A / SAQ A-EP scope reduction strategy). |
| 6: Secure systems and applications | Dependencies kept up to date; input validation and the layered N-tier architecture reduce attack surface. |
| 7–8: Access control & authentication | Role-based access control (admin vs customer), unique credentials per user, password hashing. |
| 10: Track and monitor access | Logging of authentication and payment events for audit purposes. |
| 11: Regular testing | Recommended: periodic vulnerability scanning and penetration testing before production go-live (noted here as a deployment requirement, out of scope for the coursework build itself). |
| 12: Information security policy | This document, together with the Terms, Privacy Policy, and Security Standard section, forms the baseline security policy documentation. |

**Practical implication for this build:** by using a mock/tokenized payment service rather than directly processing card numbers, the platform's own PCI-DSS scope is minimized to the lowest compliance tier (**SAQ A**), which is the standard and recommended approach for e-commerce platforms that do not need to build their own payment infrastructure.

---

## 9. 3-D Secure 2 (3DS2)

**3-D Secure 2** is the current global standard for card-issuer authentication (EMV® 3-D Secure), required under PSD2 Strong Customer Authentication rules in the EU/UK and widely adopted globally to reduce card-not-present fraud and shift liability away from the merchant.

### How it's represented in this platform
Because a coursework build cannot hold a live card-network certification, the checkout flow includes a **simulated 3DS2 step-up challenge**:

1. Customer submits payment details at checkout.
2. The payment service layer invokes a `requires3DSChallenge()` check (simulating the issuer's risk-based authentication decision — in production, this is returned by the payment processor/card network).
3. If required, the customer is presented with a challenge step (in this build: a mock one-time-passcode modal, standing in for the bank's real OTP/biometric challenge).
4. On successful challenge completion, the payment proceeds to the authorization step already defined in the checkout logic (Section 6 of the Logic Design document).
5. The order record stores a flag (`threeDSVerified: true`) for audit purposes.

### Why this matters
3DS2's **frictionless flow** (risk-based, no challenge needed) vs. **challenge flow** (step-up authentication) distinction is reflected in the design: low-risk transactions pass straight through, while the challenge modal only appears when the simulated risk check flags it — mirroring how real issuers behave, and giving the coursework submission a defensible, standards-aware payment design even without a certified live integration.

---

## 10. TLS/SSL

| Aspect | Standard applied |
|---|---|
| Minimum protocol | TLS 1.2, with TLS 1.3 preferred where supported by the hosting platform |
| Certificate | Automatically provisioned and renewed by the hosting platform (e.g., Let's Encrypt via Render/Vercel/Netlify) — no self-signed certificates in production |
| HSTS | `Strict-Transport-Security` header set (via `helmet`) to force browsers to use HTTPS on all subsequent visits |
| Mixed content | All API calls, CDN scripts, and fonts are loaded exclusively over `https://` — no mixed active content |
| Redirect | HTTP → HTTPS redirect enforced at the hosting/infrastructure level |

TLS/SSL is the foundational transport-security control underpinning every other control in this document — PCI-DSS requirement 4, GDPR/NDPA's "appropriate technical measures" obligation, and 3DS2's secure message exchange all assume TLS is already in place.

---

## 11. Jakob Nielsen's 10 Usability Heuristics — Evaluation

A heuristic evaluation of the platform's UI against Nielsen's 10 usability heuristics:

| # | Heuristic | Evaluation |
|---|---|---|
| 1 | **Visibility of system status** | ✅ Stock badges, order status timeline, loading states, and success/error messages keep the user informed at every step. |
| 2 | **Match between system and the real world** | ✅ Familiar retail terms are used ("Cart", "Checkout", "Add to Cart") rather than internal jargon; size/color terminology matches real-world fashion conventions. |
| 3 | **User control and freedom** | ✅ Cart quantities can be adjusted or removed; ⚠️ a dedicated "cancel order" self-service action (beyond the pending/confirmed admin-controlled cancellation) could be added for stronger user control. |
| 4 | **Consistency and standards** | ✅ Consistent button styles, color-coded status badges, and layout patterns are reused across customer and admin views per the defined design system. |
| 5 | **Error prevention** | ✅ Stock validation prevents adding unavailable variants to cart before the user commits; form fields are marked required before submission is possible. |
| 6 | **Recognition rather than recall** | ✅ Saved addresses avoid re-entry at checkout; variant selections remain visible rather than requiring the user to remember what they picked. |
| 7 | **Flexibility and efficiency of use** | ⚠️ Partially met — filters and sort exist for efficient browsing; a "buy again" shortcut from order history and saved payment methods (deferred due to PCI-DSS tokenization scope) would further improve efficiency for returning users. |
| 8 | **Aesthetic and minimalist design** | ✅ The design system intentionally avoids visual clutter — text-first layouts, a restrained color palette, and no unnecessary decorative elements. |
| 9 | **Help users recognize, diagnose, and recover from errors** | ✅ Error messages are specific (e.g., "Only 3 units of this variant are available") rather than generic, directly reflecting the error-handling pattern defined in the Back-End Design document. |
| 10 | **Help and documentation** | ⚠️ Partially met — Terms, Return Policy, and Privacy Policy are available (Sections 1–2, 7), but a dedicated FAQ/help center is not yet implemented; recommended as a future enhancement. |

**Summary:** the platform meets 8 of 10 heuristics strongly, with 2 (flexibility/efficiency, help/documentation) identified as partial — both are reasonable, explicitly scoped future enhancements rather than design flaws, and are worth naming as such in the coursework submission's "limitations and future work" section.

---

## 12. Conclusion

This report demonstrates that the Fashion & Apparel E-Commerce Platform's design — carried through from the earlier idea validation, requirements, and system design documents — is explicitly aligned with global e-commerce standards across legal (Terms, Return Policy), architectural (N-tier), accessibility (WCAG 2.2), security (OWASP-aligned controls, PCI-DSS scope reduction, 3DS2, TLS/SSL), data protection (NDPA 2023 and GDPR), and usability (Nielsen's heuristics) dimensions. Where full certification-grade implementation is outside coursework scope (e.g., live PCI-DSS Level 1 processor certification, a formal DPIA), this is explicitly noted rather than glossed over, which is itself good practice when presenting a coursework system as "global-standard aligned" rather than "fully certified."
