// server/models/Incident.js

const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["Open", "In Progress", "Closed"],
    default: "Open",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent OverwriteModelError by checking if the model already exists
const Incident =
  mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);

module.exports = Incident;
