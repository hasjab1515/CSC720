const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const errorHandler = require("./middleware/errorHandler");
const { authLimiter, checkoutLimiter } = require("./middleware/rateLimiters");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// --- Global Security Standard: security headers (helmet) ---
// Sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security (HSTS), and a baseline CSP.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // product images served to the frontend origin
  })
);

// --- CORS restricted to the known frontend origin only (not a wildcard) ---
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));

app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, message: "API is running" }));

// Rate limiting applied at the route-group level (OWASP-aligned brute-force / carding mitigation)
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/orders/checkout", checkoutLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
});

app.use(errorHandler);

module.exports = app;
