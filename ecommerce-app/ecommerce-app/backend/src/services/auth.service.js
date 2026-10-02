const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");

async function register({ name, email, password, consent }) {
  // NDPA (2023) / GDPR: registration cannot proceed without explicit, affirmative consent
  if (consent !== true) {
    throw new ApiError(400, "CONSENT_REQUIRED", "You must agree to the Terms and Privacy Policy to create an account");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "EMAIL_TAKEN", "An account with that email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    consent: { given: true, timestamp: new Date() },
  });
  return issueToken(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || user.isAnonymized) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");

  return issueToken(user);
}

function issueToken(user) {
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

// NDPA (2023) / GDPR "Right to Access": export all personal data held about the user
async function exportUserData(userId) {
  const [user, orders, reviews] = await Promise.all([
    User.findById(userId).select("-passwordHash"),
    Order.find({ user: userId }),
    Review.find({ user: userId }),
  ]);
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

  return {
    exportedAt: new Date().toISOString(),
    profile: user,
    orders,
    reviews,
  };
}

// NDPA (2023) / GDPR "Right to Erasure": anonymize personal data while preserving
// order records required for legal/tax retention, without retaining identifying data.
async function deleteUserAccount(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "NOT_FOUND", "User not found");

  user.name = "Deleted User";
  user.email = `deleted-${user._id}@anonymized.local`;
  user.addresses = [];
  user.isAnonymized = true;
  await user.save();

  await Cart.deleteOne({ user: userId });
  // Order and Review documents are retained (order records required for financial/legal
  // retention periods) but no longer resolve to identifying personal data on the User record.

  return { success: true };
}

module.exports = { register, login, exportUserData, deleteUserAccount };
