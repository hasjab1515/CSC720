const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  name: String,
  size: String,
  color: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    paymentReference: String,
    // 3-D Secure 2: records whether issuer step-up authentication was completed for this payment
    threeDSVerified: { type: Boolean, default: false },
    threeDSChallengeIssued: { type: Boolean, default: false },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
