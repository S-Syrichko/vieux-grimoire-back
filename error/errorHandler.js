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
      statusCode = 400;
      message = {
        message: "Too many files uploaded. Only one file is allowed.",
      };
    } else if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 400;
      message = {
        message: "File size too large. Maximum file size allowed is 2MB.",
      };
    } else {
      statusCode = 500;
      message = {
        message: "File upload failed. Please try again later.",
      };
    }
  }
  return res.status(statusCode).json(message);
};

module.exports = errorHandler;
