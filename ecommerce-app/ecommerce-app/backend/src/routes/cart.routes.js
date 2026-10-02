const express = require("express");
const authenticate = require("../middleware/authenticate");
const ctrl = require("../controllers/cart.controller");

const router = express.Router();
router.use(authenticate);
router.get("/", ctrl.getCart);
router.post("/items", ctrl.addItem);
router.put("/items/:itemId", ctrl.updateItem);
router.delete("/items/:itemId", ctrl.removeItem);

module.exports = router;
