const asyncHandler = require("../utils/asyncHandler");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.dashboard = asyncHandler(async (req, res) => {
  const [totalOrders, revenueAgg, lowStock, outOfStock] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    Product.countDocuments({ "variants.stock": { $lte: 5, $gt: 0 } }),
    Product.countDocuments({ "variants.stock": 0 }),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      revenue: revenueAgg[0]?.total || 0,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
    },
  });
});

exports.stockAlerts = asyncHandler(async (req, res) => {
  const products = await Product.find({ "variants.stock": { $lte: 5 } });
  res.json({ success: true, data: products });
});
