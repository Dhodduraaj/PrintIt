const PrintJob = require("../models/PrintJob");
const User = require("../models/User");
const { uploadToGridFS } = require("../services/fileStorage");
const {
  getServiceStatus: getServiceStatusValue,
} = require("../services/serviceStatus");

const getContentType = (mimetype, originalname) => {
  if (mimetype) return mimetype;
  const ext = originalname.split(".").pop()?.toLowerCase();
  const types = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return types[ext] || "application/octet-stream";
};

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const {
      pageCount,
      pageRange,
      printType,
      copies,
      duplex,
      paperSize,
      orientation,
      pagesPerSheet,
    } = req.body;

    if (!pageCount || !printType) {
      return res
        .status(400)
        .json({ message: "Page count and print type are required" });
    }

    // Upload file to MongoDB GridFS
    const gridFsFileId = await uploadToGridFS(req.file.buffer, {
      originalFilename: req.file.originalname,
      contentType: getContentType(req.file.mimetype, req.file.originalname),
      studentId: req.user._id.toString(),
    });

    // Calculate amount
    const pageRate = printType === "color" ? 5 : 2;
    const calculatedAmount =
      parseInt(pageCount) * pageRate * parseInt(copies || 1);

    const job = await PrintJob.create({
      student: req.user._id,
      fileName: req.file.originalname,
      gridFsFileId,
      pageCount: parseInt(pageCount),
      pageRange: pageRange || null,
      printType,
      copies: parseInt(copies || 1),
      duplex: duplex || "single-sided",
      paperSize: paperSize || "A4",
      orientation: orientation || "portrait",
      pagesPerSheet: parseInt(pagesPerSheet || 1),
      amount: calculatedAmount,
      paymentVerified: false,
      status: "pending", // Start as pending until payment verified
    });

    res.status(201).json({
      message: "Document uploaded successfully. Please complete payment.",
      jobId: job._id,
      tokenNumber: job.tokenNumber,
      amount: calculatedAmount,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      message: err.message || "Failed to upload document. Please try again.",
    });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await PrintJob.findOne({
      _id: jobId,
      student: req.user._id,
    }).populate("student", "name email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Calculate queue position only for paid jobs in waiting/printing status
    let queuePosition = 0;
    if (
      job.paymentVerified &&
      (job.status === "waiting" || job.status === "printing")
    ) {
      queuePosition =
        (await PrintJob.countDocuments({
          status: { $in: ["waiting", "printing"] },
          paymentVerified: true,
          createdAt: { $lt: job.createdAt },
        })) + 1;
    }

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

    // Calculate queue position only for paid jobs in waiting/printing status
    let queuePosition = 0;
    if (
      job.paymentVerified &&
      (job.status === "waiting" || job.status === "printing")
    ) {
      queuePosition =
        (await PrintJob.countDocuments({
          status: { $in: ["waiting", "printing"] },
          paymentVerified: true,
          createdAt: { $lt: job.createdAt },
        })) + 1;
    }

    res.json({ job, queuePosition });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceStatus = (req, res) => {
  res.json({ isOpen: getServiceStatusValue() });
};

// Fetch all user requests with categorization (Live vs History)
exports.getAllRequests = async (req, res) => {
  try {
    const liveStatusList = ["pending", "waiting", "printing"];
    const historyStatusList = ["done"];

    // Fetch live requests (sorted by oldest first - FIFO)
    const liveRequests = await PrintJob.find({
      student: req.user._id,
      status: { $in: liveStatusList },
    })
      .sort({ createdAt: 1 })
      .populate("student", "name email");

    // Fetch history requests (sorted by most recent first)
    const historyRequests = await PrintJob.find({
      student: req.user._id,
      status: { $in: historyStatusList },
    })
      .sort({ createdAt: -1 })
      .populate("student", "name email");

    // Enrich live requests with queue position
    const enrichedLiveRequests = await Promise.all(
      liveRequests.map(async (job) => {
        const queuePosition = await PrintJob.countDocuments({
          status: { $in: ["waiting", "printing"] },
          createdAt: { $lt: job.createdAt },
        }) + (job.status === "waiting" || job.status === "printing" ? 1 : 0);

        return {
          ...job.toObject(),
          queuePosition,
        };
      })
    );

    res.json({
      liveRequests: enrichedLiveRequests,
      historyRequests,
      summary: {
        liveCount: enrichedLiveRequests.length,
        historyCount: historyRequests.length,
      },
    });
  } catch (err) {
    console.error("Error fetching all requests:", err);
    res.status(500).json({ message: err.message });
  }
};

// Clear completed/done requests (history only, not live requests)
exports.clearRequestHistory = async (req, res) => {
  try {
    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({
        message: "Confirmation required to clear history",
      });
    }

    // Only delete completed requests (done status)
    const result = await PrintJob.deleteMany({
      student: req.user._id,
      status: "done",
    });

    res.json({
      message: `Cleared ${result.deletedCount} completed request(s) from history`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error clearing request history:", err);
    res.status(500).json({ message: err.message });
  }
};

// submitPayment removed – jobs now enter the waiting queue immediately without a payment step
