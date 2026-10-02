const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, "UNAUTHORIZED", "Authentication token missing"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role }
    next();
  } catch (err) {
    next(new ApiError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

module.exports = authenticate;
