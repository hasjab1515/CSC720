const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");
const User = require("../models/User");

exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  res.status(200).json({ success: true, data: user });
});

// NDPA (2023) / GDPR: Right to Access
exports.exportData = asyncHandler(async (req, res) => {
  const data = await authService.exportUserData(req.user.userId);
  res.status(200).json({ success: true, data });
});

// NDPA (2023) / GDPR: Right to Erasure
exports.deleteAccount = asyncHandler(async (req, res) => {
  const result = await authService.deleteUserAccount(req.user.userId);
  res.status(200).json({ success: true, data: result });
});
