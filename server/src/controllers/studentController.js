const PrintJob = require("../models/PrintJob");
const User = require("../models/User");
const { uploadToGridFS } = require("../services/fileStorage");
const {
  getServiceStatus: getServiceStatusValue,
} = require("../services/serviceStatus");

const getContentType = (mimetype, originalname) => {
  if (mimetype) return mimetype;
  const ext = originalname.split(".").pop()?.toLowerCase();
  const types = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  return types[ext] || "application/octet-stream";
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { pageCount, printType, copies } = req.body;

    if (!pageCount || !printType) {
      return res.status(400).json({ message: "Page count and print type are required" });
    }

    // Upload file to MongoDB GridFS
    const gridFsFileId = await uploadToGridFS(req.file.buffer, {
      originalFilename: req.file.originalname,
      contentType: getContentType(req.file.mimetype, req.file.originalname),
      studentId: req.user._id.toString(),
    });

    // Calculate amount
    const pageRate = printType === "color" ? 5 : 2;
    const amount = parseInt(pageCount) * pageRate * parseInt(copies || 1);

    const job = await PrintJob.create({
      student: req.user._id,
      fileName: req.file.originalname,
      gridFsFileId,
      pageCount: parseInt(pageCount),
      printType,
      copies: parseInt(copies || 1),
      amount,
      status: "waiting", // Directly enter waiting queue (no payment step)
    });

    // Emit new job event
    const io = req.app.get("io");
    if (io) {
      const populatedJob = await PrintJob.findById(job._id).populate("student", "name email");
      io.emit("newJob", populatedJob);
    }

    res.status(201).json({
      message: "Document uploaded successfully",
      jobId: job._id,
      tokenNumber: job.tokenNumber,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ 
      message: err.message || "Failed to upload document. Please try again." 
    });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await PrintJob.findOne({ _id: jobId, student: req.user._id }).populate(
      "student",
      "name email"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Calculate queue position
    const queuePosition = await PrintJob.countDocuments({
      status: { $in: ["waiting", "printing"] },
      createdAt: { $lt: job.createdAt },
    }) + (job.status === "waiting" || job.status === "printing" ? 1 : 0);

    res.json({ job, queuePosition });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLatestJob = async (req, res) => {
  try {
    const job = await PrintJob.findOne({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate("student", "name email");

    if (!job) {
      return res.json({ job: null, queuePosition: 0 });
    }

    // Calculate queue position
    const queuePosition = await PrintJob.countDocuments({
      status: { $in: ["waiting", "printing"] },
      createdAt: { $lt: job.createdAt },
    }) + (job.status === "waiting" || job.status === "printing" ? 1 : 0);

    res.json({ job, queuePosition });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceStatus = (req, res) => {
  res.json({ isOpen: getServiceStatusValue() });
};

// submitPayment removed – jobs now enter the waiting queue immediately without a payment step
