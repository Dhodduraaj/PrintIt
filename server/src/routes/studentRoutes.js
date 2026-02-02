const express = require("express");
const { protect, studentOnly } = require("../middleware/auth");
const {
  uploadDocument,
  getJobStatus,
  getLatestJob,
  submitPayment,
} = require("../controllers/studentController");
const upload = require("../middleware/upload");

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(studentOnly);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/job/:jobId", getJobStatus);
router.get("/latest-job", getLatestJob);
router.post("/payment/:jobId", submitPayment);

module.exports = router;
