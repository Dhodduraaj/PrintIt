const express = require("express");
const multer = require("multer");
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

// Handle multer errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 10MB" });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.post("/upload", upload.single("file"), handleUploadError, uploadDocument);
router.get("/job/:jobId", getJobStatus);
router.get("/latest-job", getLatestJob);
router.post("/payment/:jobId", submitPayment);

module.exports = router;
