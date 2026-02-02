const mongoose = require("mongoose");

const printJobSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
      min: 1,
    },
    printType: {
      type: String,
      enum: ["black-white", "color"],
      default: "black-white",
    },
    copies: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    tokenNumber: {
      type: Number,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "waiting", "printing", "done"],
      default: "pending",
    },
    upiReferenceId: {
      type: String,
      default: null,
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Generate token number before saving
printJobSchema.pre("save", async function () {
  // IMPORTANT: In mongoose async middleware, do NOT use `next`.
  // Returning/awaiting a promise is the correct pattern.
  if (!this.tokenNumber) {
    const lastJob = await this.constructor
      .findOne()
      .sort({ tokenNumber: -1 })
      .select("tokenNumber")
      .lean();

    this.tokenNumber = lastJob?.tokenNumber ? lastJob.tokenNumber + 1 : 1000;
  }
});

module.exports = mongoose.model("PrintJob", printJobSchema);
