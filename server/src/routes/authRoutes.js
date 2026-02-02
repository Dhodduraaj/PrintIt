const express = require("express");
const { studentRegister, studentLogin, vendorLogin } = require("../controllers/authController");

const router = express.Router();

// Student routes
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);

// Vendor routes
router.post("/vendor/login", vendorLogin);

module.exports = router;
