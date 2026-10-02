const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const ctrl = require("../controllers/order.controller");

const router = express.Router();
router.use(authenticate);
router.post("/checkout", ctrl.checkout);
router.get("/", ctrl.myOrders);
router.get("/admin/all", authorize("admin"), ctrl.allOrders);
router.put("/admin/:id/status", authorize("admin"), ctrl.updateStatus);
router.get("/:id", ctrl.getOne);

module.exports = router;
