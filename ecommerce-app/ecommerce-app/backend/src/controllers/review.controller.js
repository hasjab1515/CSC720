const asyncHandler = require("../utils/asyncHandler");
const reviewService = require("../services/review.service");

exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.submitReview(req.user.userId, req.body);
  res.status(201).json({ success: true, data: review });
});

exports.forProduct = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId);
  res.json({ success: true, data: reviews });
});
