const PrintJob = require("../models/PrintJob");
const User = require("../models/User");
const { uploadToGridFS } = require("../services/fileStorage");
const {
  getServiceStatus: getServiceStatusValue,
} = require("../services/serviceStatus");
const { validatePageRange } = require("../utils/pageRangeValidator");
const { countPagesForFile } = require("../utils/pageCounter");

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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Extract common parameters from body
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

    // Check if individual file parameters are provided
    let hasIndividualParams = req.body.fileParams;

    // Parse fileParams if it's a JSON string
    if (typeof req.body.fileParams === "string") {
      try {
        hasIndividualParams = JSON.parse(req.body.fileParams);
      } catch (parseErr) {
        console.error("Error parsing fileParams:", parseErr);
        return res
          .status(400)
          .json({ message: "Invalid file parameters format" });
      }
    }

    const createdJobs = [];
    const vendorId = req.body.vendorId;

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Determine parameters for this specific file
      let filePageCount = pageCount;
      let filePageRange = pageRange;
      let filePrintType = printType;
      let fileCopies = copies;
      let fileDuplex = duplex;
      let filePaperSize = paperSize;
      let fileOrientation = orientation;
      let filePagesPerSheet = pagesPerSheet;

      if (hasIndividualParams && hasIndividualParams[i]) {
        const params = hasIndividualParams[i];
        filePageCount = params.pageCount;
        filePageRange = params.pageRange;
        filePrintType = params.printType;
        fileCopies = params.copies;
        fileDuplex = params.duplex;
        filePaperSize = params.paperSize;
        fileOrientation = params.orientation;
        filePagesPerSheet = params.pagesPerSheet;
      }

      if (!filePageCount || !filePrintType) {
        return res
          .status(400)
          .json({
            message: `Page count and print type are required for file ${i + 1}`,
          });
      }

      // Always calculate page count for every upload (no default)
      const totalPages = await countPagesForFile(
        file.buffer,
        file.mimetype,
        file.originalname,
      );
      if (totalPages != null) {
        const rangeError = validatePageRange(filePageRange, totalPages);
        if (rangeError) {
          return res.status(400).json({
            message: `${file.originalname}: ${rangeError}`,
          });
        }
      }

      // Upload file to MongoDB GridFS
      const gridFsFileId = await uploadToGridFS(file.buffer, {
        originalFilename: file.originalname,
        contentType: getContentType(file.mimetype, file.originalname),
        studentId: req.user._id.toString(),
      });

      // Calculate amount
      const pageRate = filePrintType === "color" ? 5 : 2;
      const calculatedAmount =
        parseInt(filePageCount) * pageRate * parseInt(fileCopies || 1);

      const job = await PrintJob.create({
        student: req.user._id,
        vendor: vendorId,
        fileName: file.originalname,
        gridFsFileId,
        pageCount: parseInt(filePageCount),
        totalPages: totalPages,
        pageRange: filePageRange || null,
        printType: filePrintType,
        copies: parseInt(fileCopies || 1),
        duplex: fileDuplex || "single-sided",
        paperSize: filePaperSize || "A4",
        orientation: fileOrientation || "portrait",
        pagesPerSheet: parseInt(filePagesPerSheet || 1),
        amount: calculatedAmount,
        paymentVerified: false,
        status: "pending", // Start as pending until payment verified
      });

      createdJobs.push({
        jobId: job._id,
        fileName: file.originalname,
        tokenNumber: job.tokenNumber,
        amount: calculatedAmount,
      });
    }

    res.status(201).json({
      message: `${req.files.length} document(s) uploaded successfully. Please complete payment.`,
      jobs: createdJobs,
      totalAmount: createdJobs.reduce((sum, job) => sum + job.amount, 0),
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({
      message: err.message || "Failed to upload document(s). Please try again.",
    });
  }
};

exports.getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await PrintJob.findOne({
      _id: jobId,
      student: req.user._id,
    })
      .populate("student", "name email")
      .populate("vendor", "name");

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
          vendor: job.vendor,
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
      .populate("student", "name email")
      .populate("vendor", "name");

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
          vendor: job.vendor,
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

exports.getServiceStatus = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (vendorId) {
      const vendor = await User.findById(vendorId);
      return res.json({ isOpen: vendor?.isShopOpen ?? false });
    }
    res.json({ isOpen: getServiceStatusValue() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "VENDOR" }).select("name isShopOpen");
    
    const vendorsWithQueue = await Promise.all(vendors.map(async (vendor) => {
      const queueSize = await PrintJob.countDocuments({
        vendor: vendor._id,
        status: { $in: ["waiting", "printing"] },
        paymentVerified: true
      });
      return {
        _id: vendor._id,
        name: vendor.name,
        isShopOpen: vendor.isShopOpen,
        queueSize
      };
    }));

    res.json({ vendors: vendorsWithQueue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
      .populate("student", "name email")
      .populate("vendor", "name");

    // Fetch history requests (sorted by most recent first)
    const historyRequests = await PrintJob.find({
      student: req.user._id,
      status: { $in: historyStatusList },
    })
      .sort({ createdAt: -1 })
      .populate("student", "name email")
      .populate("vendor", "name");

    // Enrich live requests with queue position
    const enrichedLiveRequests = await Promise.all(
      liveRequests.map(async (job) => {
        let queuePosition = 0;
        if (
          job.paymentVerified &&
          (job.status === "waiting" || job.status === "printing")
        ) {
          queuePosition =
            (await PrintJob.countDocuments({
              vendor: job.vendor,
              status: { $in: ["waiting", "printing"] },
              paymentVerified: true,
              createdAt: { $lt: job.createdAt },
            })) + 1;
        }

        return {
          ...job.toObject(),
          queuePosition,
        };
      }),
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
