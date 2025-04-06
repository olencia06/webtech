const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const notesController = require("../controllers/notesController");

// Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 Created 'uploads/' folder");
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log("📎 Multer will save file as:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Routes with auth middleware
router.get("/", auth, notesController.getNotes);
router.post("/", auth, upload.single("file"), notesController.createNote);

module.exports = router;
