const razorpay = require("../config/razorpay");
const PrintJob = require("../models/PrintJob");
const crypto = require("crypto");

exports.createOrder = async (req, res) => {
  try {
    const { amount, jobId } = req.body;

    if (!amount || !jobId) {
      return res.status(400).json({ message: "Amount and jobId are required" });
    }

    // Verify job belongs to user
    const job = await PrintJob.findOne({ _id: jobId, student: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${jobId}`,
      notes: {
        jobId: jobId.toString(),
        studentId: req.user._id.toString(),
        studentName: req.user.name,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_SBAb3g5u0iNULV",
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      jobId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const keySecret =
      process.env.RAZORPAY_KEY_SECRET || "W9FEYqrhzxeYWiRpUfbfrsle";
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Update job with payment details
    const job = await PrintJob.findOne({ _id: jobId, student: req.user._id });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.paymentVerified = true;
    job.upiReferenceId = razorpay_payment_id; // Store payment ID
    job.status = "waiting"; // Move to waiting queue
    await job.save();

    // Emit payment verified event
    const io = req.app.get("io");
    if (io) {
      const populatedJob = await PrintJob.findById(job._id).populate(
        "student",
        "name email",
      );
      io.emit("paymentVerified", populatedJob);
      io.emit("newJob", populatedJob);
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      job,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: error.message || "Verification failed" });
  }
};
