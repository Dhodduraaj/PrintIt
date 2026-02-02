const PrintJob = require("../models/PrintJob");
const path = require("path");
const fs = require("fs");
const { downloadFromGridFS, getBucket } = require("../services/fileStorage");
const {
  getServiceStatus,
  setServiceStatus,
} = require("../services/serviceStatus");
const { sendPickupNotification } = require("../services/smsService");
<<<<<<< Updated upstream
const { sendPickupNotification } = require("../services/smsService");
=======
>>>>>>> Stashed changes

exports.getJobs = async (req, res) => {
  try {
    // Only show jobs that have verified payment
    const jobs = await PrintJob.find({ paymentVerified: true })
      .sort({ createdAt: 1 })
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

    if (!job.paymentVerified) {
      return res
        .status(400)
        .json({ message: "Payment not verified for this job" });
    }

    if (job.status !== "waiting") {
      return res.status(400).json({ message: "Job is not in waiting status" });
    }

    job.status = "printing";
    await job.save();

    // Emit update and recalculate queue positions
    const io = req.app.get("io");
    if (io) {
      const updatedJob = await PrintJob.findById(job._id).populate(
        "student",
        "name email",
      );
      io.emit("jobUpdated", updatedJob);
      io.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "printing",
      });
      io.emit("request:status", {
        jobId: job._id,
        status: "printing",
      });

      // Recalculate and emit queue positions for all waiting/printing jobs
      const queueJobs = await PrintJob.find({
        status: { $in: ["waiting", "printing"] },
      }).sort({ createdAt: 1 });

      queueJobs.forEach((queueJob, index) => {
        io.emit("queueUpdate", {
          jobId: queueJob._id.toString(),
          queuePosition: index + 1,
        });
        io.emit("queue:update", {
          jobId: queueJob._id.toString(),
          queuePosition: index + 1,
        });
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

    // Populate student info for SMS and socket events
    const populatedJob = await PrintJob.findById(job._id).populate(
      "student",
      "name email mobileNumber",
    );

    // Send SMS notification to student (non-blocking)
    if (populatedJob.student?.mobileNumber) {
      sendPickupNotification({
        to: populatedJob.student.mobileNumber,
        studentName: populatedJob.student.name,
        job: populatedJob,
      }).catch((err) => {
        // Log but don't fail the request if SMS fails
        console.error("Failed to send pickup SMS:", err);
      });
    } else {
      console.warn(`⚠️ No mobile number found for student ${populatedJob.student?._id}. SMS not sent.`);
    }

<<<<<<< Updated upstream
    // Populate student info for SMS and socket events
    const populatedJob = await PrintJob.findById(job._id).populate(
      "student",
      "name email mobileNumber",
    );

    // Send SMS notification to student (non-blocking)
    if (populatedJob.student?.mobileNumber) {
      sendPickupNotification({
        to: populatedJob.student.mobileNumber,
        studentName: populatedJob.student.name,
        job: populatedJob,
      }).catch((err) => {
        // Log but don't fail the request if SMS fails
        console.error("Failed to send pickup SMS:", err);
      });
    } else {
      console.warn(`⚠️ No mobile number found for student ${populatedJob.student?._id}. SMS not sent.`);
    }

    // Populate student info for SMS and socket events
    const populatedJob = await PrintJob.findById(job._id).populate(
      "student",
      "name email mobileNumber",
    );

    // Send SMS notification to student (non-blocking)
    if (populatedJob.student?.mobileNumber) {
      sendPickupNotification({
        to: populatedJob.student.mobileNumber,
        studentName: populatedJob.student.name,
        job: populatedJob,
      }).catch((err) => {
        // Log but don't fail the request if SMS fails
        console.error("Failed to send pickup SMS:", err);
      });
    } else {
      console.warn(`⚠️ No mobile number found for student ${populatedJob.student?._id}. SMS not sent.`);
    }

    // Emit update and recalculate queue positions
    const io = req.app.get("io");
    if (io) {
      io.emit("jobUpdated", populatedJob);
      io.emit("jobUpdated", populatedJob);
=======
    // Emit update
    const io = req.app.get("io");
    if (io) {
      io.emit("jobUpdated", populatedJob);
>>>>>>> Stashed changes
      io.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "done",
      });
      io.emit("request:status", {
        jobId: job._id,
        status: "done",
      });

    res.json({ message: "Job marked as completed", job: populatedJob });
<<<<<<< Updated upstream
    res.json({ message: "Job marked as completed", job: populatedJob });
=======
>>>>>>> Stashed changes
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
      const { buffer, contentType } = await downloadFromGridFS(
        job.gridFsFileId,
      );
      const encodedFilename = encodeURIComponent(job.fileName);
      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${job.fileName}"; filename*=UTF-8''${encodedFilename}`,
      );
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

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Attempt to delete file from GridFS if present
    if (job.gridFsFileId) {
      try {
        const bucket = getBucket();
        // Use promise form so errors are caught here instead of crashing the process
        await bucket.delete(job.gridFsFileId);
      } catch (err) {
        // If file is already missing in GridFS, just log and continue
        console.error("Error deleting GridFS file:", err.message || err);
      }
    }

    // Attempt to delete legacy file from local /uploads if present
    if (job.filePath) {
      const filePath = path.join(__dirname, "../../", job.filePath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error deleting local file:", err.message || err);
        }
      }
    }

    await job.deleteOne();

    // Notify connected clients that a job was deleted
    const io = req.app.get("io");
    if (io) {
      io.emit("jobDeleted", { jobId });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteDoneHistory = async (req, res) => {
  try {
    const doneJobs = await PrintJob.find({ status: "done" });
    const io = req.app.get("io");
    const jobIds = [];

    for (const job of doneJobs) {
      if (job.gridFsFileId) {
        try {
          const bucket = getBucket();
          await bucket.delete(job.gridFsFileId);
        } catch (err) {
          console.error("Error deleting GridFS file:", err.message || err);
        }
      }
      if (job.filePath) {
        const filePath = path.join(__dirname, "../../", job.filePath);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error("Error deleting local file:", err.message || err);
          }
        }
      }
      await job.deleteOne();
      jobIds.push(job._id.toString());
      if (io) {
        io.emit("jobDeleted", { jobId: job._id });
      }
    }

    res.json({
      message: "Done history deleted successfully",
      deleted: jobIds.length,
      jobIds,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceStatus = (req, res) => {
  res.json({ isOpen: getServiceStatus() });
};

exports.updateServiceStatus = (req, res) => {
  const { isOpen } = req.body;

  if (typeof isOpen !== "boolean") {
    return res.status(400).json({ message: "isOpen must be a boolean" });
  }

  setServiceStatus(isOpen);

  const io = req.app.get("io");
  if (io) {
    io.emit("serviceStatusChanged", { isOpen });
  }

  res.json({ isOpen });
};
