const rateLimit = require("express-rate-limit");

// Mitigates brute-force login/credential-stuffing attacks (OWASP A07: Identification & Authentication Failures)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts. Please try again later." } },
});

// Mitigates card-testing ("carding") abuse against the checkout/payment endpoint
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many checkout attempts. Please try again later." } },
});

module.exports = { authLimiter, checkoutLimiter };
