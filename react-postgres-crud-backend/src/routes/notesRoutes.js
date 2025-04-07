const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const auth = require("../middleware/authMiddleware");
const notesController = require("../controllers/notesController");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📂 Created 'uploads/' folder");
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    console.log("📎 Saving file as original:", filename);
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Routes
router.get("/", auth, notesController.getNotes);
router.post("/", auth, upload.single("file"), notesController.createNote);
router.delete("/:id", auth, notesController.deleteNote); // 🔥 Added DELETE route

module.exports = router;
