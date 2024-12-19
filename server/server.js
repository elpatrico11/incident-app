const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serwowanie statycznych plików (obrazków)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importing routes
const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const categoryRoutes = require("./routes/categories");
const adminRoutes = require("./routes/admin");
const adminReportsRoutes = require("./routes/adminReports");
const adminReportsDownload = require("./routes/adminReportsDownload");

// Using routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin/reports", adminReportsDownload);

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
