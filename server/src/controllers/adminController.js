const PrintJob = require("../models/PrintJob");

exports.getAnalytics = async (req, res) => {
  try {
    const totalJobs = await PrintJob.countDocuments();

    // Calculate average wait time (time from pending to printing)
    const completedJobs = await PrintJob.find({ status: "done" });
    let totalWaitTime = 0;
    completedJobs.forEach((job) => {
      const waitTime = (job.updatedAt - job.createdAt) / (1000 * 60); // minutes
      totalWaitTime += waitTime;
    });
    const avgWaitTime =
      completedJobs.length > 0
        ? Math.round(totalWaitTime / completedJobs.length)
        : 0;

    // Active users (students with pending/waiting/printing jobs)
    const activeUsers = await PrintJob.distinct("student", {
      status: { $in: ["pending", "waiting", "printing"] },
    });

    // Completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await PrintJob.countDocuments({
      status: "done",
      updatedAt: { $gte: today },
    });

    // Peak hour analysis (jobs created between 10 AM - 2 PM)
    const peakHourStart = new Date();
    peakHourStart.setHours(10, 0, 0, 0);
    const peakHourEnd = new Date();
    peakHourEnd.setHours(14, 0, 0, 0);

    const peakHourJobs = await PrintJob.countDocuments({
      createdAt: { $gte: peakHourStart, $lte: peakHourEnd },
    });

    // Status distribution
    const statusCounts = {
      waiting: await PrintJob.countDocuments({
        status: "waiting",
        paymentVerified: true,
      }),
      printing: await PrintJob.countDocuments({
        status: "printing",
        paymentVerified: true,
      }),
      done: await PrintJob.countDocuments({
        status: "done",
        paymentVerified: true,
      }),
      pending: await PrintJob.countDocuments({
        status: "pending",
        paymentVerified: false,
      }),
    };

    // Total revenue
    const allJobs = await PrintJob.find({ paymentVerified: true });
    const totalRevenue = allJobs.reduce(
      (sum, job) => sum + (job.amount || 0),
      0,
    );

    // Average processing time
    const processingJobs = await PrintJob.find({
      status: "done",
      updatedAt: { $exists: true },
    });
    let totalProcessingTime = 0;
    processingJobs.forEach((job) => {
      const processingTime = (job.updatedAt - job.createdAt) / (1000 * 60); // minutes
      totalProcessingTime += processingTime;
    });
    const avgProcessingTime =
      processingJobs.length > 0
        ? Math.round(totalProcessingTime / processingJobs.length)
        : 0;

    res.json({
      totalJobs,
      avgWaitTime,
      activeUsers: activeUsers.length,
      completedToday,
      peakHourJobs,
      peakHour: "10:00 AM - 2:00 PM",
      statusCounts,
      totalRevenue,
      avgProcessingTime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { verified } = req.body;

    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.paymentVerified = verified;
    if (verified) {
      job.status = "waiting"; // Move to waiting queue once payment is verified
    }
    await job.save();

    // Emit payment verification event
    const io = req.app.get("io");
    if (io) {
      const populatedJob = await PrintJob.findById(job._id).populate(
        "student",
        "name email",
      );
      io.emit("paymentVerified", populatedJob);
    }

    res.json({
      message: verified
        ? "Payment verified successfully"
        : "Payment marked as unverified",
      job,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
