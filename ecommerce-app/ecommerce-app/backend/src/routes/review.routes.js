const express = require("express");
const authenticate = require("../middleware/authenticate");
const ctrl = require("../controllers/review.controller");

const router = express.Router();
router.get("/product/:productId", ctrl.forProduct);
router.post("/", authenticate, ctrl.create);

module.exports = router;
