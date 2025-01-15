const express = require("express");
const cors = require("cors");
const path = require("path");
const configureEnv = require("./config/dotenv");
const { generalLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

// Ładujemy zmienne środowiskowe (możesz je załadować już w głównym pliku)
configureEnv();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(generalLimiter);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/contact", require("./routes/contact"));

// Default Route
app.get("/", (req, res) => {
  res.send("API działa");
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
