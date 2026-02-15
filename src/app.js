const express = require("express");
const app = express();
const authRoutes = require("./routes/auth.routes");
const blogRoutes = require("./routes/blog.routes");

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.send("Blogging API is live!");
});

module.exports = app;
