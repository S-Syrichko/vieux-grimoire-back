const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.log(err);
  statusCode = err.statusCode || 500;
  message = { message: err.message, error: err };

  if (err.name === "ValidationError") {
    message = { message: "Données invalides" };
  }
  // Multer-specific error handling
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res
        .status(400)
        .json({ error: "Too many files uploaded. Only one file is allowed." });
    } else if (err.code === "LIMIT_FILE_SIZE") {
      res
        .status(400)
        .json({
          error: "File size too large. Maximum file size allowed is 2MB.",
        });
    } else {
      res
        .status(500)
        .json({ error: "File upload failed. Please try again later." });
    }
  }
  return res.status(statusCode).json(message);
};

module.exports = errorHandler;
