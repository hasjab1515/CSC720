const express = require("express");
const authenticate = require("../middleware/authenticate");
const ctrl = require("../controllers/auth.controller");

const router = express.Router();
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", authenticate, ctrl.me);
router.get("/export-data", authenticate, ctrl.exportData);   // NDPA/GDPR right to access
router.delete("/me", authenticate, ctrl.deleteAccount);      // NDPA/GDPR right to erasure

module.exports = router;
