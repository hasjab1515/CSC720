const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");

const TAX_RATE = 0.08;
const FLAT_SHIPPING = 5.99;
const THREE_DS_RISK_THRESHOLD = 50; // orders above this amount trigger a simulated issuer step-up challenge
const THREE_DS_DEMO_OTP = "123456"; // demo-mode fixed OTP standing in for a real bank challenge
const THREE_DS_CHALLENGE_TTL_MS = 5 * 60 * 1000;

// In-memory challenge store (demo-mode only). In production this would be managed by the
// card issuer / 3-D Secure Access Control Server (ACS), not by the merchant's own server.
const pendingChallenges = new Map();

function evaluate3DSRisk(amount) {
  // Simulates a risk-based authentication decision (EMV 3-D Secure 2 "frictionless vs. challenge" flow)
  return amount >= THREE_DS_RISK_THRESHOLD;
}

const VALID_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

// Mock payment gateway (test mode only — no real transactions)
async function mockCharge(amount) {
  return { status: "success", reference: "MOCK-" + Date.now() + "-" + Math.floor(Math.random() * 1e6) };
}

async function checkout(userId, { shippingAddress, challengeId, otp }) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "EMPTY_CART", "Your cart is empty");
  }

  // Step 1: authoritative stock re-validation
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);
    if (!variant || variant.stock < item.quantity) {
      throw new ApiError(
        400,
        "INSUFFICIENT_STOCK",
        `"${item.name}" (${item.size}/${item.color}) is no longer available in that quantity`
      );
    }
  }

  // Step 2: totals
  const subtotal = cart.items.reduce((sum, i) => sum + i.priceAtAdd * i.quantity, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const shipping = cart.items.length ? FLAT_SHIPPING : 0;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  // Step 2.5: 3-D Secure 2 — risk-based step-up authentication
  let threeDSVerified = false;
  if (evaluate3DSRisk(total)) {
    if (!challengeId || !otp) {
      // No challenge response yet: issue one and return it to the caller instead of charging.
      const newChallengeId = randomUUID();
      pendingChallenges.set(newChallengeId, { userId, amount: total, expiresAt: Date.now() + THREE_DS_CHALLENGE_TTL_MS });
      return {
        requiresChallenge: true,
        challengeId: newChallengeId,
        amount: total,
        message: "Issuer authentication required (3-D Secure 2). Enter the verification code sent by your bank.",
      };
    }

    const challenge = pendingChallenges.get(challengeId);
    if (!challenge || challenge.userId !== userId || challenge.expiresAt < Date.now()) {
      throw new ApiError(401, "3DS_CHALLENGE_EXPIRED", "Your verification session expired. Please try again.");
    }
    if (otp !== THREE_DS_DEMO_OTP) {
      throw new ApiError(401, "3DS_CHALLENGE_FAILED", "Incorrect verification code.");
    }
    pendingChallenges.delete(challengeId);
    threeDSVerified = true;
  }

  // Step 3: mock payment (only reached once any required 3DS challenge has passed)
  const payment = await mockCharge(total);
  if (payment.status !== "success") {
    throw new ApiError(402, "PAYMENT_FAILED", "Payment could not be processed");
  }

  // Step 4: atomic stock decrement per item (prevents overselling)
  const decrementedItems = [];
  try {
    for (const item of cart.items) {
      const result = await Product.updateOne(
        { _id: item.product, "variants._id": item.variantId, "variants.stock": { $gte: item.quantity } },
        { $inc: { "variants.$.stock": -item.quantity } }
      );
      if (result.matchedCount === 0) {
        throw new ApiError(400, "SOLD_OUT", `"${item.name}" sold out during checkout`);
      }
      decrementedItems.push(item);
    }
  } catch (err) {
    // Roll back any decrements already applied, and "refund" the mock payment
    for (const item of decrementedItems) {
      await Product.updateOne(
        { _id: item.product, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": item.quantity } }
      );
    }
    throw err;
  }

  // Step 5: create order with a snapshot of item data
  const order = await Order.create({
    user: userId,
    items: cart.items.map((i) => ({
      product: i.product,
      variantId: i.variantId,
      name: i.name,
      size: i.size,
      color: i.color,
      image: i.image,
      price: i.priceAtAdd,
      quantity: i.quantity,
    })),
    shippingAddress,
    status: "pending",
    paymentStatus: "paid",
    paymentReference: payment.reference,
    threeDSVerified,
    threeDSChallengeIssued: threeDSVerified,
    subtotal,
    tax,
    shipping,
    total,
    statusHistory: [{ status: "pending", timestamp: new Date() }],
  });

  cart.items = [];
  await cart.save();

  return order;
}

async function getUserOrders(userId) {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
}

async function getOrder(orderId, userId, role) {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found");
  if (role !== "admin" && order.user.toString() !== userId) {
    throw new ApiError(403, "FORBIDDEN", "Not your order");
  }
  return order;
}

async function getAllOrders() {
  return Order.find().sort({ createdAt: -1 }).populate("user", "name email");
}

async function updateStatus(orderId, newStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "NOT_FOUND", "Order not found");

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ApiError(400, "INVALID_TRANSITION", `Cannot move order from ${order.status} to ${newStatus}`);
  }

  if (newStatus === "cancelled") {
    // restore stock
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": item.quantity } }
      );
    }
  }

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date() });
  await order.save();
  return order;
}

module.exports = { checkout, getUserOrders, getOrder, getAllOrders, updateStatus };
