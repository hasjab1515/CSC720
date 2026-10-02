const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const ctrl = require("../controllers/product.controller");

const router = express.Router();
router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", authenticate, authorize("admin"), ctrl.create);
router.put("/:id", authenticate, authorize("admin"), ctrl.update);
router.put("/:id/variants/:variantId", authenticate, authorize("admin"), ctrl.updateVariantStock);
router.delete("/:id", authenticate, authorize("admin"), ctrl.remove);

module.exports = router;
