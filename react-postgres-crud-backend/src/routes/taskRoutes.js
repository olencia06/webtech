// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// Get all tasks for the authenticated user
router.get("/", auth, getTasks);

// Create a new task for the authenticated user
router.post("/", auth, createTask);

// Update a task by ID (only for the owner)
router.put("/:id", auth, updateTask);

// Delete a task by ID (only for the owner)
router.delete("/:id", auth, deleteTask);

module.exports = router;
