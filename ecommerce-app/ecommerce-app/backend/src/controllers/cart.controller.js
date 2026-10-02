const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cart.service");

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.userId);
  res.json({ success: true, data: cart });
});

exports.addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.userId, req.body);
  res.status(201).json({ success: true, data: cart });
});

exports.updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.userId, req.params.itemId, req.body.quantity);
  res.json({ success: true, data: cart });
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.userId, req.params.itemId);
  res.json({ success: true, data: cart });
});
