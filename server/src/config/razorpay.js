const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_SBAb3g5u0iNULV",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "W9FEYqrhzxeYWiRpUfbfrsle",
});

module.exports = razorpay;
