const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Token invalid" });
  }
};

exports.vendorOnly = (req, res, next) => {
  if (req.user.role !== "VENDOR") {
    return res.status(403).json({ message: "Vendor access only" });
  }
  next();
};
