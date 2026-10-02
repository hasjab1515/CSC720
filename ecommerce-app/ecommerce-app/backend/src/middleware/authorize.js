const ApiError = require("../utils/ApiError");

function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== requiredRole) {
      return next(new ApiError(403, "FORBIDDEN", `Requires ${requiredRole} role`));
    }
    next();
  };
}

module.exports = authorize;
