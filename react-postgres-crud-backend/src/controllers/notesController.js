const pool = require("../models/db");
const path = require("path");

// GET Notes with JOIN to users
const getNotes = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const result = await pool.query(
      `
      SELECT notes.*, users.username
      FROM notes
      INNER JOIN users ON notes.user_id = users.id
      WHERE users.id = $1
      ORDER BY notes.uploaded_at DESC
      `,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching notes with join:", err.message);
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};

// CREATE Note with optional JOIN validation
const createNote = async (req, res) => {
  console.log("📥 [createNote] New note upload request received.");

  const userId = req.user?.id;
  const { title, subject } = req.body;
  const file = req.file;

  if (!userId || !title || !subject || !file) {
    return res.status(400).json({
      message: "User, title, subject, and file are required.",
      debug: { userId, title, subject, file },
    });
  }

  const filePath = path.join("uploads", file.filename);

  try {
    // Optional: Validate user exists via JOIN (or simple SELECT)
    const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await pool.query(
      `
      INSERT INTO notes (user_id, title, subject, file_path)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [userId, title, subject, filePath]
    );

    res.status(201).json({
      message: "Note uploaded successfully",
      note: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error uploading note:", err.message);
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
