const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sorting logic based on file type
    if (file.mimetype === "application/pdf") {
      cb(null, "uploads/pdfs"); // New PDFs go here
    } else {
      cb(null, "uploads/images"); // New Images go here
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });
module.exports = upload;
