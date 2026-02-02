const multer = require("multer");
const upload = require("./upload");

// Wrapper to handle multer errors properly
const handleFileUpload = (fieldName = "file") => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName); // Allow multiple files
    uploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ 
              message: "File too large. Maximum size is 10MB" 
            });
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: "Too many files uploaded" });
          }
          return res.status(400).json({ message: err.message });
        }
        // Handle other errors (like fileFilter errors)
        return res.status(400).json({ message: err.message });
      }
      // No error, proceed to next middleware
      next();
    });
  };
};

module.exports = handleFileUpload;
