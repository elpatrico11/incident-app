const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Importing routes
const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");

// Using routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("API działa");
});

// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Połączono z MongoDB");
    app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
  })
  .catch((err) => console.error("Błąd połączenia z MongoDB:", err));
