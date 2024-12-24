const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();
const Incident = require("../models/Incident");
const optionalAuth = require("../middleware/optionalAuth");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");

// Multer Configuration

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Update the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Use the absolute path
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File type validation
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types are: ${allowedTypes}. Received mimetype: ${file.mimetype}, filename: ${file.originalname}`
      )
    );
  }
};

// Initialize Multer with storage, file filter, and size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// Helper Function: Verify reCAPTCHA

const verifyRecaptcha = async (token) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "reCAPTCHA secret key not defined in environment variables"
    );
  }

  const params = new URLSearchParams();
  params.append("secret", secretKey);
  params.append("response", token);

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params,
      {
        timeout: 5000,
      }
    );
    return response.data.success;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    throw new Error("Failed to verify reCAPTCHA");
  }
};

// Route: Add a New Incident

router.post("/", optionalAuth, (req, res) => {
  upload.single("image")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          msg: "Plik jest za duży. Maksymalny rozmiar to 5 MB.",
          detail: err.message,
        });
      }
      return res.status(400).json({
        msg: "Błąd podczas przesyłania pliku",
        detail: err.message,
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        msg: "Błąd podczas przesyłania pliku",
        detail: err.message,
      });
    }

    // Proceed with existing logic after successful upload
    try {
      // If user is not authenticated, verify captcha
      if (!req.user) {
        const captchaToken = req.body.captcha;
        if (!captchaToken) {
          return res
            .status(400)
            .json({ msg: "Proszę przejść weryfikację reCAPTCHA." });
        }
        try {
          const isHuman = await verifyRecaptcha(captchaToken);
          if (!isHuman) {
            return res
              .status(400)
              .json({ msg: "Nieprawidłowa weryfikacja reCAPTCHA." });
          }
        } catch (err) {
          console.error("reCAPTCHA verification error:", err.message);
          return res.status(500).json({ msg: "Błąd weryfikacji reCAPTCHA." });
        }
      }

      const {
        category,
        description,
        location,
        status,
        severity,
        dataZdarzenia, // New field
        dniTygodnia, // New field
        poraDnia, // New field
      } = req.body;

      // **Removed Required Field Validations**
      // Now, these fields are optional. Only assign them if they are provided.

      // Parse location if it's a JSON string
      let parsedLocation;
      if (location) {
        try {
          parsedLocation = JSON.parse(location);
          if (
            parsedLocation.type !== "Point" ||
            !Array.isArray(parsedLocation.coordinates) ||
            parsedLocation.coordinates.length !== 2
          ) {
            return res.status(400).json({ msg: "Invalid location format" });
          }
        } catch (err) {
          return res.status(400).json({ msg: "Invalid location JSON" });
        }
      } else {
        return res.status(400).json({ msg: "Lokalizacja jest wymagana." });
      }

      // Handle single image upload
      let images = [];
      if (req.file) {
        images.push(
          `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        );
      }

      // Initialize the new incident with mandatory fields
      const newIncidentData = {
        category,
        description,
        location: parsedLocation,
        images,
        status: status || "Nowe",
        severity: severity || "Low",
      };

      // Conditionally add optional fields if they are provided
      if (dataZdarzenia) {
        newIncidentData.dataZdarzenia = new Date(dataZdarzenia);
      }

      if (dniTygodnia && Array.isArray(dniTygodnia) && dniTygodnia.length > 0) {
        newIncidentData.dniTygodnia = dniTygodnia;
      }

      if (poraDnia) {
        newIncidentData.poraDnia = poraDnia;
      }

      const newIncident = new Incident(newIncidentData);

      // If status is 'Rozwiązane', set resolvedAt
      if (newIncident.status === "Rozwiązane") {
        newIncident.resolvedAt = new Date();
      }

      if (req.user) {
        newIncident.user = req.user.id;
        console.log("Assigning incident to user:", req.user.id);
      } else {
        console.log("Incident created without user association");
      }

      const incident = await newIncident.save();
      res.json(incident); // `incident` includes `createdAt` and `updatedAt`
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  });
});

// Route: Get All Incidents

router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "date_desc",
      status,
      category,
      search,
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== "All") {
      query.status = status;
    }

    // Filter by category
    if (category && category !== "All") {
      query.category = category;
    }

    // Search by description
    if (search) {
      query.description = { $regex: search, $options: "i" };
    }

    // Sorting criteria
    let sortCriteria = {};
    switch (sort) {
      case "date_desc":
        sortCriteria = { createdAt: -1 };
        break;
      case "date_asc":
        sortCriteria = { createdAt: 1 };
        break;
      case "status_asc":
        sortCriteria = { status: 1 };
        break;
      case "status_desc":
        sortCriteria = { status: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const totalIncidents = await Incident.countDocuments(query);
    const totalPages = Math.ceil(totalIncidents / limit);
    const incidents = await Incident.find(query)
      .populate("user", ["firstName", "lastName", "email", "role"])
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ incidents, totalPages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Route: Get My Incidents

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const incidents = await Incident.find({ user: req.user.id }).populate(
      "user",
      ["firstName", "lastName", "email", "role"]
    );
    res.json(incidents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Route: Get Single Incident

router.get("/:id", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate("user", [
      "firstName",
      "lastName",
      "email",
      "role",
    ]);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    const formattedIncident = incident.toObject();
    formattedIncident.createdAt = incident.createdAt.toLocaleString("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    });

    res.json(formattedIncident);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }
    res.status(500).send("Błąd serwera");
  }
});

// Route: Update an Incident

router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]), // Only admin or the user who created the incident
  (req, res) => {
    upload.single("image")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ msg: "Plik jest za duży. Maksymalny rozmiar to 5 MB." });
        }
        return res.status(400).json({ msg: err.message });
      } else if (err) {
        // Unknown errors
        return res.status(400).json({ msg: err.message });
      }

      // Proceed with existing logic after successful upload
      try {
        const {
          category,
          description,
          location,
          status,
          severity,
          dataZdarzenia, // New field
          dniTygodnia, // New field
          poraDnia, // New field
        } = req.body;

        // Initialize an object to hold the fields to update
        const incidentFields = {};

        if (category) incidentFields.category = category;
        if (description) incidentFields.description = description;
        if (status) incidentFields.status = status;
        if (severity) incidentFields.severity = severity;

        // Handle new fields
        if (dataZdarzenia) {
          incidentFields.dataZdarzenia = new Date(dataZdarzenia);
        }

        if (dniTygodnia) {
          if (Array.isArray(dniTygodnia) && dniTygodnia.length > 0) {
            incidentFields.dniTygodnia = dniTygodnia;
          } else {
            // Optionally, you can choose to clear the field if an empty array is sent
            incidentFields.dniTygodnia = [];
            // Or ignore updating this field if no valid data is provided
          }
        }

        if (poraDnia) {
          incidentFields.poraDnia = poraDnia;
        }

        // Parse the location field if it exists
        if (location) {
          try {
            const parsedLocation = JSON.parse(location);
            // Validate GeoJSON structure
            if (
              parsedLocation.type === "Point" &&
              Array.isArray(parsedLocation.coordinates) &&
              parsedLocation.coordinates.length === 2
            ) {
              incidentFields.location = parsedLocation;
            } else {
              return res.status(400).json({ msg: "Invalid location format" });
            }
          } catch (err) {
            return res.status(400).json({ msg: "Invalid location JSON" });
          }
        }

        // Handle image upload if a new image is provided
        if (req.file) {
          const newImageUrl = `${req.protocol}://${req.get("host")}/uploads/${
            req.file.filename
          }`;
          incidentFields.images = [newImageUrl]; // Replace existing images with the new one
        }

        let incident = await Incident.findById(req.params.id);

        if (!incident) {
          return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
        }

        // Check if the user has permission to edit the incident
        if (
          incident.user &&
          incident.user.toString() !== req.user.id &&
          req.user.role !== "admin"
        ) {
          return res.status(401).json({ msg: "Brak uprawnień" });
        }

        // If status is 'Rozwiązane', set resolvedAt
        if (status === "Rozwiązane" && incident.status !== "Rozwiązane") {
          incidentFields.resolvedAt = new Date();
        } else if (
          status &&
          status !== "Rozwiązane" &&
          incident.status === "Rozwiązane"
        ) {
          incidentFields.resolvedAt = undefined; // Remove resolvedAt if status changes from Rozwiązane
        }

        // Update the incident
        incident = await Incident.findByIdAndUpdate(
          req.params.id,
          { $set: incidentFields },
          { new: true }
        ).populate("user", ["firstName", "lastName", "email", "role"]); // Optionally re-populate the user

        res.json(incident);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Błąd serwera");
      }
    });
  }
);

// Route: Delete an Incident

router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]), // Only admin or the user who created the incident
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }

      // Check if the user has permission to delete the incident
      if (
        incident.user &&
        incident.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(401).json({ msg: "Brak uprawnień" });
      }

      await Incident.findByIdAndDelete(req.params.id);

      res.json({ msg: "Zgłoszenie usunięte" });
    } catch (err) {
      console.error(err.message);
      if (err.kind === "ObjectId") {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }
      res.status(500).send("Błąd serwera");
    }
  }
);

// Route: Add a Comment to an Incident

router.post("/:id/comments", authMiddleware, async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ msg: "Komentarz jest wymagany" });
  }

  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione." });
    }

    const newComment = {
      user: req.user.id,
      text,
    };

    incident.comments.unshift(newComment);
    await incident.save();

    const populatedComment = await incident.populate("comments.user", [
      "firstName",
      "lastName",
      "email",
    ]);

    res.json(populatedComment.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Route: Get Comments for an Incident

router.get("/:id/comments", async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "comments.user",
      ["firstName", "lastName", "email"]
    );

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    res.json(incident.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Route: Update Incident Status

router.put(
  "/:id/status",
  authMiddleware,
  authorize("admin"), // Only administrators can change status
  async (req, res) => {
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ msg: "Status jest wymagany." });
    }

    // Normalize status: capitalize first letter and lowercase the rest
    // This handles cases where frontend might send lowercase
    status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Updated status validation with correct capitalization
    const validStatuses = [
      "Nowe",
      "Weryfikacja",
      "Potwierdzone",
      "Wstrzymane",
      "Eskalowane",
      "Rozwiązane",
      "Nierozwiązane",
      "Zamknięte",
      "Odrzucone",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Nieprawidłowa wartość statusu" });
    }

    try {
      let incident = await Incident.findById(req.params.id).populate("user", [
        "firstName",
        "lastName",
        "email",
        "role",
      ]);

      if (!incident) {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }

      // Update status
      incident.status = status;

      // Middleware in the model will handle setting statusCategory

      // If status is in 'Końcowe' category, set resolvedAt
      const finalStatuses = [
        "Rozwiązane",
        "Nierozwiązane",
        "Zamknięte",
        "Odrzucone",
      ];
      if (finalStatuses.includes(status)) {
        incident.resolvedAt = new Date();
      } else {
        incident.resolvedAt = undefined; // Remove resolvedAt if status is not final
      }

      await incident.save();

      res.json(incident);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

module.exports = router;
