const express = require("express");
const { protect, vendorOnly } = require("../middleware/auth");
const {
  getJobs,
  approveJob,
  completeJob,
  downloadFile,
  deleteJob,
} = require("../controllers/vendorController");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(vendorOnly);

router.get("/jobs", getJobs);
router.post("/jobs/:jobId/approve", approveJob);
router.post("/jobs/:jobId/complete", completeJob);
router.get("/jobs/:jobId/download", downloadFile);
router.delete("/jobs/:jobId", deleteJob);

module.exports = router;
