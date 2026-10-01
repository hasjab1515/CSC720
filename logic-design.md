# System Design: Logic Design

## Fashion & Apparel E-Commerce Platform

---

## 1. Introduction

This document defines the **logic design** of the platform — the core business rules, process flows, decision logic, and algorithms that govern how the system behaves, independent of UI or database implementation details. It complements the front-end design and data model by specifying *how the system thinks*, not just what it displays or stores.

---

## 2. Core Business Rules

| Rule | Description |
|---|---|
| BR1 | A product cannot be added to the cart if the selected variant's stock is 0. |
| BR2 | Stock is only decremented at successful payment confirmation, not at add-to-cart. |
| BR3 | A review can only be submitted by a user who has a `delivered` order containing that exact product. |
| BR4 | An order's status can only move forward (pending → confirmed → shipped → delivered), never backward, except to `cancelled` from `pending` or `confirmed`. |
| BR5 | Prices shown in cart/checkout are locked at time of order placement (snapshotted), regardless of later product price changes. |
| BR6 | Only users with role `admin` can access product/stock/order management endpoints. |

---

## 3. Authentication & Authorization Logic

```
FUNCTION login(email, password):
    user = findUserByEmail(email)
    IF user does NOT exist:
        RETURN error "Invalid credentials"
    IF NOT verifyPasswordHash(password, user.passwordHash):
        RETURN error "Invalid credentials"
    token = generateJWT({ userId: user._id, role: user.role }, expiresIn = "7d")
    RETURN token

FUNCTION authorize(request, requiredRole = "customer"):
    token = extractTokenFromHeader(request)
    IF token is missing OR invalid:
        RETURN 401 Unauthorized
    payload = verifyJWT(token)
    IF requiredRole == "admin" AND payload.role != "admin":
        RETURN 403 Forbidden
    RETURN payload   // attached to request for downstream use
```

**Decision logic:** every admin route runs `authorize(request, "admin")` as middleware *before* the controller executes — authorization is never left to the frontend alone (see NFR4).

---

## 4. Product Browsing & Filtering Logic

```
FUNCTION getFilteredProducts(filters):
    query = {}
    IF filters.category: query.category = filters.category
    IF filters.minPrice OR filters.maxPrice:
        query.basePrice = { >= filters.minPrice, <= filters.maxPrice }
    IF filters.size:
        query."variants.size" = filters.size
    IF filters.color:
        query."variants.color" = filters.color
    IF filters.search:
        query.name = matches(filters.search, caseInsensitive = true)

    results = Product.find(query).sort(filters.sortBy OR "newest")
    RETURN paginate(results, filters.page, filters.pageSize)
```

**Note:** filtering by variant attributes (size/color) queries into the embedded `variants` array — this is the main reason variants were embedded rather than referenced (see database schema).

---

## 5. Cart Logic

```
FUNCTION addToCart(userId, productId, variantId, quantity):
    product = getProduct(productId)
    variant = product.variants.find(v => v._id == variantId)

    IF variant does NOT exist:
        RETURN error "Invalid variant"
    IF variant.stock < quantity:
        RETURN error "Insufficient stock"      // enforces BR1

    cart = getOrCreateCart(userId)
    existingItem = cart.items.find(i => i.variantId == variantId)

    IF existingItem exists:
        newQty = existingItem.quantity + quantity
        IF newQty > variant.stock:
            RETURN error "Insufficient stock"
        existingItem.quantity = newQty
    ELSE:
        cart.items.push({ productId, variantId, quantity, priceAtAdd: variant.priceOverride OR product.basePrice })

    save(cart)
    RETURN cart
```

**Design decision:** stock is *checked* here but not *reserved* — this is a coursework-appropriate simplification. The authoritative check happens again at checkout (see Section 6) to prevent overselling between add-to-cart and payment.

---

## 6. Checkout & Order Placement Logic

This is the most critical logic path in the system, since it must prevent overselling and keep financial data consistent.

```
FUNCTION placeOrder(userId, cartId, shippingAddress, paymentToken):
    cart = getCart(cartId)
    IF cart.items is empty:
        RETURN error "Cart is empty"

    // Step 1: Re-validate stock for every item (authoritative check)
    FOR EACH item IN cart.items:
        product = getProduct(item.productId)
        variant = product.variants.find(v => v._id == item.variantId)
        IF variant.stock < item.quantity:
            RETURN error "'{product.name}' ({variant.size}/{variant.color}) is no longer available in that quantity"

    // Step 2: Calculate totals
    subtotal = SUM(item.priceAtAdd * item.quantity FOR item IN cart.items)
    tax = subtotal * TAX_RATE
    shipping = calculateShipping(shippingAddress, cart.items)
    total = subtotal + tax + shipping

    // Step 3: Charge payment (test mode)
    paymentResult = paymentGateway.charge(paymentToken, total)
    IF paymentResult.status != "success":
        RETURN error "Payment failed"

    // Step 4: Atomically decrement stock (prevents overselling under concurrency)
    FOR EACH item IN cart.items:
        decremented = Product.updateOne(
            { _id: item.productId, "variants._id": item.variantId, "variants.stock": >= item.quantity },
            { $inc: { "variants.$.stock": -item.quantity } }
        )
        IF decremented.matchedCount == 0:
            // Another order beat this one to the last unit — roll back
            paymentGateway.refund(paymentResult.paymentIntentId)
            RETURN error "'{item.productName}' sold out during checkout — payment refunded"

    // Step 5: Create order with a data snapshot (enforces BR5)
    order = createOrder({
        user: userId,
        items: cart.items.map(i => ({
            product: i.productId, variantId: i.variantId,
            name: i.productName, size: i.size, color: i.color,
            price: i.priceAtAdd, quantity: i.quantity
        })),
        shippingAddress, subtotal, tax, shipping, total,
        status: "pending",
        paymentStatus: "paid",
        paymentIntentId: paymentResult.paymentIntentId,
        statusHistory: [{ status: "pending", timestamp: now() }]
    })

    clearCart(cartId)
    sendOrderConfirmationEmail(userId, order)
    RETURN order
```

**Key logic decisions worth highlighting in the report:**
- Stock is validated **twice** (add-to-cart, and again atomically at checkout) — the second check is the one that actually matters for correctness under concurrent orders.
- The atomic `updateOne` with a stock-guard condition (`stock >= quantity`) is what prevents two simultaneous orders from both succeeding on the last unit — a classic race condition in e-commerce systems.
- If any item fails during the atomic decrement step, the already-completed payment is refunded rather than leaving the customer charged with no order.

---

## 7. Order Status Logic (State Machine)

```
        ┌─────────┐
        │ pending │
        └────┬────┘
             │ admin confirms
             ▼
        ┌───────────┐        ┌───────────┐
        │ confirmed │───────▶│ cancelled │  (only from pending/confirmed)
        └────┬──────┘        └───────────┘
             │ admin marks shipped
             ▼
        ┌─────────┐
        │ shipped │
        └────┬────┘
             │ admin marks delivered
             ▼
        ┌───────────┐
        │ delivered │ ──▶ unlocks "Leave a Review" for items in this order
        └───────────┘
```

```
FUNCTION updateOrderStatus(orderId, newStatus, actorRole):
    IF actorRole != "admin":
        RETURN 403 Forbidden

    order = getOrder(orderId)
    validTransitions = {
        "pending":    ["confirmed", "cancelled"],
        "confirmed":  ["shipped", "cancelled"],
        "shipped":    ["delivered"],
        "delivered":  [],
        "cancelled":  []
    }

    IF newStatus NOT IN validTransitions[order.status]:
        RETURN error "Invalid status transition: {order.status} -> {newStatus}"

    order.status = newStatus
    order.statusHistory.push({ status: newStatus, timestamp: now() })

    IF newStatus == "cancelled":
        restoreStock(order.items)   // return reserved stock back to variants

    save(order)
    RETURN order
```

---

## 8. Review Submission Logic

```
FUNCTION submitReview(userId, productId, rating, comment, images):
    hasDeliveredOrder = Order.exists({
        user: userId,
        status: "delivered",
        "items.product": productId
    })

    IF NOT hasDeliveredOrder:
        RETURN error "You can only review products you have purchased and received"   // enforces BR3

    review = createReview({
        product: productId, user: userId, rating, comment, images,
        verifiedPurchase: true
    })

    // Recalculate denormalized rating fields on the product
    stats = Review.aggregate([
        { match: { product: productId } },
        { group: { avgRating: AVG(rating), reviewCount: COUNT() } }
    ])
    Product.updateOne({ _id: productId }, { avgRating: stats.avgRating, reviewCount: stats.reviewCount })

    RETURN review
```

---

## 9. Admin Stock Alert Logic

```
FUNCTION getLowStockAlerts(threshold = 5):
    products = Product.find({ "variants.stock": <= threshold, "variants.stock": > 0 })
    outOfStock = Product.find({ "variants.stock": == 0 })
    RETURN {
        lowStock: products,     // shown as amber warning in admin dashboard
        outOfStock: outOfStock  // shown as red alert in admin dashboard
    }
```

---

## 10. Data Flow Overview

```
[Customer Browser] 
     │  filter/search
     ▼
[Product Listing Logic] ──▶ [Product Collection]
     │  select variant, add to cart
     ▼
[Cart Logic] ──▶ [Cart Collection]
     │  checkout
     ▼
[Checkout Logic] ──▶ [Payment Gateway (Stripe test mode)]
     │                        │
     │  success                │ failure
     ▼                        ▼
[Order Creation] ──▶ [Order Collection]   [Return error to customer]
     │
     ▼
[Stock Decrement] ──▶ [Product Collection (variants.stock)]
     │
     ▼
[Order Confirmation] ──▶ [Customer]

[Admin Browser] ──▶ [Order Status Logic] ──▶ [Order Collection]
                 └─▶ [Stock Alert Logic] ──▶ reads [Product Collection]
```

---

## 11. Error Handling Logic (General Pattern)

```
FUNCTION handleRequest(request):
    TRY:
        validateInput(request.body)          // 400 on invalid shape
        result = executeBusinessLogic(request)
        RETURN 200/201 with result
    CATCH ValidationError:
        RETURN 400 with error details
    CATCH AuthError:
        RETURN 401/403
    CATCH NotFoundError:
        RETURN 404
    CATCH PaymentError:
        RETURN 402 with payment failure reason
    CATCH UnexpectedError:
        logError(error)
        RETURN 500 "Something went wrong"
```

Consistent error handling ensures the frontend can rely on predictable status codes and error shapes across all endpoints, rather than special-casing each feature.

---

## 12. Conclusion

The logic design centers on three correctness-critical flows — **stock validation at checkout, order status transitions, and verified-purchase reviews** — each of which enforces a specific business rule (BR1–BR6) at the code level rather than relying on the UI to prevent invalid states. This logic layer sits between the front-end (Section: Front-End Design) and the data model (database schema/ERD), and should be implemented as backend service/controller functions rather than embedded in route handlers directly, to keep it testable.
