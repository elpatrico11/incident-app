const mongoose = require("mongoose");

const User = require("./User");

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

// Define the Status Log Schema
const StatusLogSchema = new mongoose.Schema({
  previousStatus: {
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
    required: true,
  },
  newStatus: {
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
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
    address: {
      type: String, // <--- new field for the human-readable address
      required: false,
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
    statusLogs: [StatusLogSchema],

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
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Middleware to log status changes
IncidentSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  let status, changedBy;

  if (update.$set) {
    status = update.$set.status;
    changedBy = update.$set.changedBy;
  }

  if (status) {
    try {
      const incident = await this.model.findOne(this.getQuery());
      const previousStatus = incident.status;
      const newStatus = status;

      if (previousStatus !== newStatus) {
        if (!changedBy) {
          throw new Error("Brak informacji o użytkowniku zmieniającym status.");
        }

        this.updateOne(
          {},
          {
            $push: {
              statusLogs: {
                previousStatus,
                newStatus,
                changedAt: new Date(),
                changedBy: changedBy,
              },
            },
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

IncidentSchema.pre("save", function (next) {
  // If the incident is new, or if status hasn’t changed, do nothing
  if (this.isNew || !this.isModified("status")) {
    return next();
  }

  this.constructor
    .findById(this._id)
    .then((oldIncident) => {
      if (!oldIncident) return next();

      const oldStatus = oldIncident.status;
      const newStatus = this.status;

      // Only log if there's an actual change
      if (oldStatus !== newStatus) {
        if (!this.changedBy) {
          console.warn("No changedBy user specified for this status change.");
        } else {
          this.statusLogs.push({
            previousStatus: oldStatus,
            newStatus,
            changedAt: new Date(),
            changedBy: this.changedBy,
          });
        }
      }
      next();
    })
    .catch(next);
});

module.exports = mongoose.model("Incident", IncidentSchema);
