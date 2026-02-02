const express = require("express");
const { protect, studentOnly } = require("../middleware/auth");
const {
  uploadDocument,
  getJobStatus,
  getLatestJob,
  getServiceStatus,
  getAllRequests,
  clearRequestHistory,
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
router.get("/service-status", getServiceStatus);

// User Requests Dashboard routes
router.get("/requests/all", getAllRequests);
router.delete("/requests/history", clearRequestHistory);

module.exports = router;
