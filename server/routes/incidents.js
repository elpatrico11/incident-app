const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const multer = require("multer");
const path = require("path");
const optionalAuth = require("../middleware/optionalAuth"); // Importowanie opcjonalnego middleware
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize"); // Importujemy authorize middleware

// Konfiguracja multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder do przechowywania obrazków
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unikalna nazwa pliku
  },
});

const upload = multer({ storage: storage });

// Tworzenie nowego zgłoszenia z przesyłaniem obrazków (opcjonalna autoryzacja)
router.post("/", optionalAuth, upload.array("images", 5), async (req, res) => {
  const { category, description, location } = req.body;

  // Parse location if it's a JSON string
  let parsedLocation;
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

  const images = req.files.map(
    (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
  );

  try {
    const newIncident = new Incident({
      category,
      description,
      location: parsedLocation, // Use parsed location
      images,
    });

    if (req.user) {
      newIncident.user = req.user.id;
    }

    const incident = await newIncident.save();
    res.json(incident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie wszystkich zgłoszeń bez uwierzytelniania
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find().populate("user", [
      "firstName",
      "lastName",
      "email",
      "role",
    ]);
    res.json(incidents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie pojedynczego zgłoszenia (publiczne)
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

    res.json(incident);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }
    res.status(500).send("Błąd serwera");
  }
});

// Aktualizacja zgłoszenia (chronione)
router.put(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]), // Tylko admin lub użytkownik
  upload.single("image"),
  async (req, res) => {
    const { category, description, location, status } = req.body;

    // Initialize an object to hold the fields to update
    const incidentFields = {};

    if (category) incidentFields.category = category;
    if (description) incidentFields.description = description;
    if (status) incidentFields.status = status;

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

    try {
      let incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }

      // Sprawdzenie, czy użytkownik ma prawo edytować zgłoszenie
      if (
        incident.user &&
        incident.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(401).json({ msg: "Brak uprawnień" });
      }

      // Aktualizacja zgłoszenia
      incident = await Incident.findByIdAndUpdate(
        req.params.id,
        { $set: incidentFields },
        { new: true }
      ).populate("user", ["firstName", "lastName", "email", "role"]); // Opcjonalnie ponownie populuj użytkownika

      res.json(incident);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

// Usuwanie zgłoszenia (chronione)
router.delete(
  "/:id",
  authMiddleware,
  authorize(["admin", "user"]), // Tylko admin lub użytkownik
  async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);

      if (!incident) {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }

      // Sprawdzenie, czy użytkownik ma prawo usunąć zgłoszenie
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

// Dodawanie komentarza do incydentu (chronione)
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

// Pobieranie komentarzy dla incydentu (publiczne)
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

// **Nowa Trasa: Aktualizacja Statusu Incydentu**
router.put(
  "/:id/status",
  authMiddleware,
  authorize("admin"), // Tylko administratorzy mogą zmieniać status
  async (req, res) => {
    const { status } = req.body;

    // Walidacja statusu
    const validStatuses = ["Pending", "In Progress", "Resolved"];
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

      // Aktualizacja statusu
      incident.status = status;
      await incident.save();

      res.json(incident);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

module.exports = router;
