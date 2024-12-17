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
const IncidentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional to allow adding incidents without login
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Akty wandalizmu",
        "Dzikie wysypiska śmieci",
        "Grupowanie się małoletnich zagrożonych demoralizacją",
        "Kłusownictwo",
        "Miejsca niebezpieczne na wodach",
        "Miejsce niebezpiecznej działalności rozrywkowej",
        "Nielegalna wycinka drzew",
        "Nielegalne rajdy samochodowe",
        "Nieprawidłowe parkowanie",
        "Niestrzeżone przejście przez tory",
        "Niestrzeżony przejazd kolejowy",
        "Niewłaściwa infrastruktura drogowa",
        "Niszczenie zieleni",
        "Osoba bezdomna wymagająca pomocy",
        "Poruszanie się po terenach leśnych quadami",
        "Przekraczanie dozwolonej prędkości",
        "Spożywanie alkoholu w miejscach niedozwolonych",
        "Używanie środków odurzających",
        "Wałęsające się bezpańskie psy",
        "Wypalanie traw",
        "Zdarzenia drogowe z udziałem zwierząt leśnych",
        "Znęcanie się nad zwierzętami",
        "Zła organizacja ruchu drogowego",
        "Żebractwo",
        "Inne", // Polish equivalent for "Other"
      ],
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
    resolvedAt: { type: Date }, // New field for resolution timestamp
    comments: [CommentSchema], // Embed comments
  },
  {
    timestamps: true, // Correct placement of timestamps option
  }
);

// Geospatial index for location queries
IncidentSchema.index({ location: "2dsphere" });

// Export the Incident model
module.exports = mongoose.model("Incident", IncidentSchema);
