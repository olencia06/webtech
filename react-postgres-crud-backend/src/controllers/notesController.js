const notesModel = require("../models/notesModel");
const path = require("path");

// Controller to fetch all notes
const getNotes = async (req, res) => {
  console.log("Fetching notes...");
  try {
    const notes = await notesModel.getAllNotes();
    res.status(200).json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// Controller to create a new note
const createNote = async (req, res) => {
  const { title, subject } = req.body;
  const file = req.file;

  if (!title || !subject || !file) {
    return res
      .status(400)
      .json({ message: "Title, subject, and file are required." });
  }

  const filePath = path.join("uploads", file.filename);

  try {
    const newNote = await notesModel.addNote(title, subject, filePath);
    res.status(201).json({ message: "Note added successfully", note: newNote });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: "Failed to create note" });
  }
};

module.exports = { getNotes, createNote };
