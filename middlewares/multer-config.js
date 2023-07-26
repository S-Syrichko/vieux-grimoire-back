const multer = require("multer");
const { RequestError } = require("../error/customError.js");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = Object.keys(MIME_TYPES);
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new RequestError(400, "Format de fichier non valide. Seuls les fichiers jpg, jpeg et png sont acceptés.")
    );
  }
};

module.exports = multer({ storage, fileFilter }).single("image");
