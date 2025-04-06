// server.js or index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes"); // ✅ Import taskRoutes
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // ✅ Mount the route here

// Example protected test route (optional)
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
