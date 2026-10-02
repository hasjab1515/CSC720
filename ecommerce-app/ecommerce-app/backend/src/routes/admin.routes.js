const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const ctrl = require("../controllers/admin.controller");

const router = express.Router();
router.use(authenticate, authorize("admin"));
router.get("/dashboard", ctrl.dashboard);
router.get("/stock-alerts", ctrl.stockAlerts);

module.exports = router;
