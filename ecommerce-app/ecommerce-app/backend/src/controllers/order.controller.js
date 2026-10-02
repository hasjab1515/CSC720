const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/order.service");

exports.checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout(req.user.userId, req.body);
  res.status(201).json({ success: true, data: order });
});

exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.userId);
  res.json({ success: true, data: orders });
});

exports.getOne = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.id, req.user.userId, req.user.role);
  res.json({ success: true, data: order });
});

exports.allOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.json({ success: true, data: orders });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data: order });
});
