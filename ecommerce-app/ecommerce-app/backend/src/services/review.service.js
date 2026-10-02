const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

async function submitReview(userId, { productId, rating, comment }) {
  const hasDeliveredOrder = await Order.exists({
    user: userId,
    status: "delivered",
    "items.product": productId,
  });

  if (!hasDeliveredOrder) {
    throw new ApiError(
      403,
      "NOT_VERIFIED_PURCHASE",
      "You can only review products from orders that have been delivered to you"
    );
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
    verifiedPurchase: true,
  });

  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      avgRating: Number(stats[0].avgRating.toFixed(2)),
      reviewCount: stats[0].count,
    });
  }

  return review;
}

async function getProductReviews(productId) {
  return Review.find({ product: productId }).sort({ createdAt: -1 }).populate("user", "name");
}

module.exports = { submitReview, getProductReviews };
