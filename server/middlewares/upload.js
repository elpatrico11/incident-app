const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use the absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File type validation
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types are: ${allowedTypes}. Received mimetype: ${file.mimetype}, filename: ${file.originalname}`
      )
    );
  }
};

// Initialize Multer with storage, file filter, and size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

module.exports = upload;
