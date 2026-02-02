const PrintJob = require("../models/PrintJob");
const path = require("path");
const fs = require("fs");
const { downloadFromGridFS } = require("../services/fileStorage");

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

    // Fetch from MongoDB GridFS (new storage)
    if (job.gridFsFileId) {
      const { buffer, contentType } = await downloadFromGridFS(job.gridFsFileId);
      const encodedFilename = encodeURIComponent(job.fileName);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${job.fileName}"; filename*=UTF-8''${encodedFilename}`);
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
      return;
    }

    // Fallback: legacy files from local /uploads
    if (job.filePath) {
      const filePath = path.join(__dirname, "../../", job.filePath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }
      res.download(filePath, job.fileName, (err) => {
        if (err) {
          res.status(500).json({ message: "Error downloading file" });
        }
      });
      return;
    }

    return res.status(404).json({ message: "File not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
