const PrintJob = require("../models/PrintJob");
const path = require("path");
const fs = require("fs");

exports.getJobs = async (req, res) => {
  try {
    const jobs = await PrintJob.find()
      .sort({ createdAt: -1 })
      .populate("student", "name email studentId");

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "waiting") {
      return res.status(400).json({ message: "Job is not in waiting status" });
    }

    if (!job.paymentVerified) {
      return res.status(400).json({ message: "Payment must be verified first" });
    }

    job.status = "printing";
    await job.save();

    // Emit update
    const io = req.app.get("io");
    if (io) {
      const updatedJob = await PrintJob.findById(job._id).populate("student", "name email");
      io.emit("jobUpdated", updatedJob);
      io.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "printing",
      });
    }

    res.json({ message: "Job approved and printing started", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { upiReferenceId } = req.body;

    if (!upiReferenceId) {
      return res.status(400).json({ message: "UPI reference ID is required" });
    }

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if UPI reference matches
    if (job.upiReferenceId !== upiReferenceId.trim()) {
      return res.status(400).json({ message: "UPI reference ID does not match" });
    }

    // Check if already used by another job
    const existingJob = await PrintJob.findOne({
      upiReferenceId: upiReferenceId.trim(),
      _id: { $ne: jobId },
      paymentVerified: true,
    });

    if (existingJob) {
      return res.status(400).json({
        message: "This UPI reference ID has already been used for another job",
      });
    }

    job.paymentVerified = true;
    if (job.status === "pending") {
      job.status = "waiting";
    }
    await job.save();

    // Emit update
    const io = req.app.get("io");
    if (io) {
      const updatedJob = await PrintJob.findById(job._id).populate("student", "name email");
      io.emit("jobUpdated", updatedJob);
      io.emit("jobStatusUpdate", {
        jobId: job._id,
        status: job.status,
      });
    }

    res.json({ message: "Payment verified successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "printing") {
      return res.status(400).json({ message: "Job is not currently printing" });
    }

    job.status = "done";
    await job.save();

    // Emit update
    const io = req.app.get("io");
    if (io) {
      const updatedJob = await PrintJob.findById(job._id).populate("student", "name email");
      io.emit("jobUpdated", updatedJob);
      io.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "done",
      });
    }

    res.json({ message: "Job marked as completed", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const filePath = path.join(__dirname, "../../", job.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.download(filePath, job.fileName, (err) => {
      if (err) {
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
