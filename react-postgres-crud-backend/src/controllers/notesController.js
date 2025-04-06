const pool = require("../models/db");
const path = require("path");

// Get notes for authenticated user
const getNotes = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY uploaded_at DESC",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching notes:", err.message);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// Add new note for authenticated user
const createNote = async (req, res) => {
  console.log("📥 [createNote] New note upload request received.");

  const userId = req.user?.id;
  const { title, subject } = req.body;
  const file = req.file;

  console.log("🧾 Request body:", req.body);
  console.log("📎 Uploaded file:", file);
  console.log("👤 Authenticated user ID:", userId);

  if (!userId || !title || !subject || !file) {
    console.warn(
      "⚠️ Missing data - one of userId, title, subject, or file is undefined"
    );
    return res.status(400).json({
      message: "User, title, subject, and file are required.",
      debug: { userId, title, subject, file },
    });
  }

  const filePath = path.join("uploads", file.filename);
  console.log("📂 File will be stored at:", filePath);

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, title, subject, file_path) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, title, subject, filePath]
    );

    console.log("✅ Note inserted into DB:", result.rows[0]);

    res.status(201).json({
      message: "Note uploaded successfully",
      note: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error uploading note to DB:", err.message);
    console.error("📛 Full error object:", err);
    res.status(500).json({
      message: "Failed to upload note",
      error: err.message,
    });
  }
};

module.exports = {
  getNotes,
  createNote,
};
