require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createVendor = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/printflow";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Check if vendor already exists
    const existingVendor = await User.findOne({ email: "vendor@printflow.com" });
    if (existingVendor) {
      console.log("⚠️ Vendor already exists");
      process.exit(0);
    }

    // Create vendor
    const hashedPassword = await bcrypt.hash("vendor123", 10);
    const vendor = await User.create({
      name: "Print Vendor",
      email: "vendor@printflow.com",
      password: hashedPassword,
      role: "VENDOR",
    });

    console.log("✅ Vendor created successfully!");
    console.log("Email: vendor@printflow.com");
    console.log("Password: vendor123");
    console.log("Vendor ID:", vendor._id);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating vendor:", error.message);
    process.exit(1);
  }
};

createVendor();
