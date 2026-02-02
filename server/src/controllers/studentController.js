const PrintJob = require("../models/PrintJob");
const User = require("../models/User");
const { uploadToGridFS } = require("../services/fileStorage");

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
      status: "pending", // Waiting for payment
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

exports.submitPayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { upiReferenceId } = req.body;

    if (!upiReferenceId) {
      return res.status(400).json({ message: "UPI reference ID is required" });
    }

    const job = await PrintJob.findOne({ _id: jobId, student: req.user._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if UPI reference ID is already used
    const existingJob = await PrintJob.findOne({
      upiReferenceId: upiReferenceId.trim(),
      _id: { $ne: jobId },
    });

    if (existingJob) {
      return res.status(400).json({
        message: "This UPI reference ID has already been used",
      });
    }

    job.upiReferenceId = upiReferenceId.trim();
    job.status = "waiting"; // Move to waiting queue after payment
    await job.save();

    // Emit update
    const io = req.app.get("io");
    if (io) {
      const updatedJob = await PrintJob.findById(job._id).populate("student", "name email");
      io.emit("jobUpdated", updatedJob);
      io.emit("queueUpdate", {
        jobId: job._id,
        job: updatedJob,
        queuePosition: await PrintJob.countDocuments({
          status: { $in: ["waiting", "printing"] },
          createdAt: { $lt: job.createdAt },
        }) + 1,
      });
    }

    res.json({
      success: true,
      message: "Payment submitted. Waiting for vendor verification.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
