const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // Usunięcie `required: true`, aby umożliwić zgłaszanie bez logowania
    required: false,
  },
  category: {
    type: String,
    required: true,
    enum: ["Vandalism", "Accident", "Safety Hazard", "Other"],
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  location: {
    type: {
      type: String, // Typ geograficzny
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  images: [
    {
      type: String, // URL obrazka
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indeks geospatialny
IncidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", IncidentSchema);
