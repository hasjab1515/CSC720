const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: [addressSchema],
    // NDPA (2023) / GDPR: explicit, auditable consent record — never pre-ticked, captured at registration
    consent: {
      given: { type: Boolean, required: true, default: false },
      timestamp: { type: Date },
    },
    isAnonymized: { type: Boolean, default: false }, // set true after a "right to erasure" request
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
