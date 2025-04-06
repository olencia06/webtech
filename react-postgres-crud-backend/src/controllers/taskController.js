const pool = require("../models/db");

// GET tasks
exports.getTasks = async (req, res) => {
  console.log("📥 getTasks triggered");

  try {
    console.log("🔍 User object from auth middleware:", req.user);

    const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
      req.user.id,
    ]);

    console.log(`📦 Retrieved ${result.rows.length} tasks from DB`);

    const tasks = result.rows.map((task) => ({
      ...task,
      due_date: task.due_date
        ? task.due_date.toLocaleDateString("en-CA")
        : null,
    }));

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error in getTasks:", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.createTask = async (req, res) => {
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
exports.updateTask = async (req, res) => {
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
exports.deleteTask = async (req, res) => {
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
