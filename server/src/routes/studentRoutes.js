const express = require("express");
const { protect, studentOnly } = require("../middleware/auth");
const {
  uploadDocument,
  getJobStatus,
  getLatestJob,
  submitPayment,
} = require("../controllers/studentController");
const handleFileUpload = require("../middleware/uploadHandler");

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(studentOnly);

// Upload route with proper error handling
router.post("/upload", handleFileUpload("file"), uploadDocument);
router.get("/job/:jobId", getJobStatus);
router.get("/latest-job", getLatestJob);
router.post("/payment/:jobId", submitPayment);

module.exports = router;
