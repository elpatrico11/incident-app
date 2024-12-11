// server/models/Incident.js
const mongoose = require("mongoose");

// Import the User model
const User = require("./User"); // Adjust the path if necessary

// Define the Comment Schema
const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define the Incident Schema
const IncidentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Made optional to allow adding incidents without login
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
      type: String, // GeoJSON type
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
      type: String, // Image URL
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  comments: [CommentSchema], // Embed comments
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Geospatial index for location queries
IncidentSchema.index({ location: "2dsphere" });

// Export the Incident model
module.exports = mongoose.model("Incident", IncidentSchema);
