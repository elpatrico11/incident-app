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
        "Inne",
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
      enum: [
        "Nowe",
        "Weryfikacja",
        "Potwierdzone",
        "Wstrzymane",
        "Eskalowane",
        "Rozwiązane",
        "Nierozwiązane",
        "Zamknięte",
        "Odrzucone",
      ],
      default: "Nowe",
    },
    statusCategory: {
      type: String,
      enum: ["Wstępne", "Aktywne", "Końcowe"],
      required: true,
      default: "Wstępne",
    },
    resolvedAt: { type: Date },
    comments: [CommentSchema], // Embed comments

    dataZdarzenia: {
      type: Date,
      required: false,
    },
    dniTygodnia: {
      type: [String],
      enum: [
        "Poniedziałek",
        "Wtorek",
        "Środa",
        "Czwartek",
        "Piątek",
        "Sobota",
        "Niedziela",
      ],
      required: false,
    },
    poraDnia: {
      type: String,
      enum: ["Rano", "Popołudnie", "Wieczór", "Noc"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for location queries
IncidentSchema.index({ location: "2dsphere" });

// Middleware to set statusCategory based on status
IncidentSchema.pre("save", function (next) {
  const initialStatuses = ["Nowe", "Weryfikacja"];
  const activeStatuses = ["Potwierdzone", "Wstrzymane", "Eskalowane"];
  const finalStatuses = [
    "Rozwiązane",
    "Nierozwiązane",
    "Zamknięte",
    "Odrzucone",
  ];

  if (initialStatuses.includes(this.status)) {
    this.statusCategory = "Wstępne";
  } else if (activeStatuses.includes(this.status)) {
    this.statusCategory = "Aktywne";
  } else if (finalStatuses.includes(this.status)) {
    this.statusCategory = "Końcowe";
  }

  next();
});

// Export the Incident model
module.exports = mongoose.model("Incident", IncidentSchema);
