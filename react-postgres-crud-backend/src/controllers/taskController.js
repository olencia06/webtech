const pool = require("../models/db");

// GET tasks
const getTasks = async (req, res) => {
  const userId = req.user?.id;
  const { search, priority, status, date } = req.query;

  console.log("🔍 Fetching tasks...");
  console.log("🧑 User ID:", userId);
  console.log("🔎 Filters received:", { search, priority, status, date });

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let query = `SELECT * FROM tasks WHERE user_id = $1`;
  let values = [userId];
  let index = 2;

  if (search) {
    query += ` AND title ILIKE $${index}`;
    values.push(`%${search}%`);
    index++;
  }

  if (priority) {
    query += ` AND LOWER(TRIM(priority)) = LOWER(TRIM($${index}))`;
    values.push(priority);
    index++;
  }

  if (status === "completed") {
    query += ` AND is_completed = true`;
  } else if (status === "incomplete") {
    query += ` AND is_completed = false`;
  }

  if (date) {
    query += ` AND due_date::date = $${index}`; // Cast to date
    values.push(date);
    index++;
  }

  query += ` ORDER BY due_date ASC`;

  console.log("📄 Final Query:", query);
  console.log("🧾 Values:", values);

  try {
    const result = await pool.query(query, values);
    console.log(`✅ Returned ${result.rows.length} task(s)`);
    return res.json(result.rows);
  } catch (error) {
    console.error("❌ Error executing query:", error.message);
    return res.status(500).json({ error: "Server Error" });
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

  try {
    // No need to reformat due_date if it's already in 'YYYY-MM-DD'
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title, description, due_date, priority]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error inserting task:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE task (no date adjustment)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, status, is_completed } =
    req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           priority = COALESCE($4, priority),
           status = COALESCE($5, status),
           is_completed = COALESCE($6, is_completed)
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        title,
        description,
        due_date, // <- Pass it directly, no Date conversion
        priority,
        status,
        is_completed,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });
    }

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
