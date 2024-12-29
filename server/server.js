const express = require("express");
const path = require("path");
const cors = require("cors");
const configureEnv = require("./config/dotenv");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middlewares/rateLimiter");
const errorHandler = require("./middlewares/errorHandler");

const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const categoryRoutes = require("./routes/categories");
const adminRoutes = require("./routes/admin");
const notificationsRoutes = require("./routes/notifications");

const app = express();

// Configure Environment Variables
configureEnv();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(generalLimiter);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationsRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API działa");
});

// Error Handling Middleware (should be after all routes)
app.use(errorHandler);

// MongoDB Connection and Server Startup
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
