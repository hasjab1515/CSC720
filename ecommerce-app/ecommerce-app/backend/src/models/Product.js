const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  sku: { type: String },
  stock: { type: Number, required: true, default: 0, min: 0 },
  priceOverride: { type: Number },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    brand: { type: String, default: "" },
    category: { type: String, required: true },
    basePrice: { type: Number, required: true },
    images: [{ type: String }],
    variants: [variantSchema],
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
