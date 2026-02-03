const express = require("express");
const { protect, studentOnly } = require("../middleware/auth");
const {
  uploadDocument,
  getJobStatus,
  getLatestJob,
  getServiceStatus,
  getAllRequests,
  clearRequestHistory,
  getAllVendors,
} = require("../controllers/studentController");
const handleFileUpload = require("../middleware/uploadHandler");

const router = express.Router();

// Routes
router.get("/vendors", protect, studentOnly, getAllVendors);
router.post("/upload", protect, studentOnly, handleFileUpload("file"), uploadDocument);
router.get("/job/:jobId", protect, studentOnly, getJobStatus);
router.get("/latest-job", protect, studentOnly, getLatestJob);
router.get("/service-status", protect, studentOnly, getServiceStatus);
router.get("/requests/all", protect, studentOnly, getAllRequests);
router.delete("/requests/history", protect, studentOnly, clearRequestHistory);

module.exports = router;
