const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const { getAnalytics } = require("../controllers/adminController");

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(adminOnly);

router.get("/analytics", getAnalytics);

module.exports = router;
