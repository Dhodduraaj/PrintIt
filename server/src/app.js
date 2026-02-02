const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/authRoutes");




app.use("/api/auth", authRoutes);
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "PrintFlow backend running 🚀" });
});

module.exports = app;
