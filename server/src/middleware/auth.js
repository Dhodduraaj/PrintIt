const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

exports.studentOnly = (req, res, next) => {
  if (req.user.role !== "STUDENT") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
};

exports.vendorOnly = (req, res, next) => {
  if (req.user.role !== "VENDOR") {
    return res.status(403).json({ message: "Vendor access only" });
  }
  next();
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
