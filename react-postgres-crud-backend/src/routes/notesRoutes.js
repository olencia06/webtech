const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define upload destination
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename
  },
});

const upload = multer({ storage });

// Define routes properly
router.get("/notes", notesController.getNotes); // Correct route handler for getNotes
router.post("/notes", upload.single("file"), notesController.createNote); // Correct route handler for createNote
console.log("Route handler for /notes: ", notesController.getNotes);

module.exports = router;
