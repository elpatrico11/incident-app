const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("API działa");
});

// Połączenie z MongoDB
const PORT = process.env.PORT || 5000;
const URI = process.env.MONGO_URI;

mongoose
  .connect(URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
  })
  .catch((err) => console.log(err));
