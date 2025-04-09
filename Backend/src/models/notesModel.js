// models/notesModel.js
const db = require("./db"); // Adjust the path to your actual db file

// Add a new note to the database
const addNote = async (title, subject, filePath) => {
  try {
    const result = await db.query(
      "INSERT INTO notes (title, subject, file_path) VALUES ($1, $2, $3) RETURNING *",
      [title, subject, filePath]
    );
    return result.rows[0];
  } catch (err) {
    throw new Error("Error adding note to database");
  }
};

// Get all notes from the database
const getAllNotes = async () => {
  try {
    const result = await db.query("SELECT * FROM notes");
    return result.rows;
  } catch (err) {
    throw new Error("Error fetching notes from database");
  }
};

module.exports = { addNote, getAllNotes };
