const pool = require("../models/db");

// GET tasks
const getTasks = async (req, res) => {
  const userId = req.user?.id;
  const { date } = req.query;

  console.log("🔍 Fetching tasks...");
  console.log("🧑 Logged-in user ID:", userId);
  console.log("📅 Date filter (if any):", date);

  try {
    if (!userId) {
      console.warn("⚠️ No user ID found in request. Unauthorized access?");
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (date) {
      console.log("📁 Fetching tasks for specific date...");
      const result = await pool.query(
        `SELECT * FROM tasks WHERE user_id = $1 AND due_date = $2`,
        [userId, date]
      );
      console.log(`✅ ${result.rows.length} task(s) fetched for date ${date}`);
      return res.json(result.rows);
    }

    console.log("📁 Fetching all tasks for user...");
    const result = await pool.query(`SELECT * FROM tasks WHERE user_id = $1`, [
      userId,
    ]);

    console.log(
      `✅ ${result.rows.length} total task(s) found for user ${userId}`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const getUpcomingTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND due_date > CURRENT_DATE ORDER BY due_date ASC LIMIT 5`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const createTask = async (req, res) => {
  const { title, description, due_date, priority } = req.body;
  console.log("📥 createTask triggered");
  console.log("🧑 User:", req.user); // Confirm user is available

  try {
    const formattedDate = new Date(due_date);
    const isoDate = formattedDate.toISOString().split("T")[0];

    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, description, due_date, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description, isoDate, priority]
    );

    console.log("✅ Task inserted:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting task:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE task (no date adjustment)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, status } = req.body;
  try {
    // ✅ No date shifting here
    const result = await pool.query(
      "UPDATE tasks SET title=$1, description=$2, due_date=$3, priority=$4, status=$5 WHERE id=$6 AND user_id=$7 RETURNING *",
      [title, description, due_date, priority, status, id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE task
const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id=$1 AND user_id=$2", [
      id,
      req.user.id,
    ]);
    res.json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getTasks,
  getUpcomingTasks,
  createTask,
  updateTask,
  deleteTask,
};
