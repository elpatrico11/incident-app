// server/routes/incidents.js
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const multer = require("multer");
const path = require("path");

// const authMiddleware = require('../middleware/auth'); // Usunięte dla POST i GET

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

// Tworzenie nowego zgłoszenia z przesyłaniem obrazków
router.post("/", upload.array("images", 5), async (req, res) => {
  const { category, description, location } = req.body;
  const images = req.files.map(
    (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
  );

  try {
    const newIncident = new Incident({
      category,
      description,
      location,
      images,
    });

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
    ]);
    res.json(incidents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie pojedynczego zgłoszenia (pozostawione chronione)
const authMiddleware = require("../middleware/auth");

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate("user", [
      "firstName",
      "lastName",
      "email",
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
router.put("/:id", authMiddleware, async (req, res) => {
  const { category, description, location, images, status } = req.body;

  // Budowanie obiektu z polami do aktualizacji
  const incidentFields = {};
  if (category) incidentFields.category = category;
  if (description) incidentFields.description = description;
  if (location) incidentFields.location = location;
  if (images) incidentFields.images = images;
  if (status) incidentFields.status = status;

  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    // Sprawdzenie, czy użytkownik ma prawo edytować zgłoszenie
    if (incident.user && incident.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Brak uprawnień" });
    }

    // Aktualizacja zgłoszenia
    incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: incidentFields },
      { new: true }
    );

    res.json(incident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Usuwanie zgłoszenia (chronione)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    // Sprawdzenie, czy użytkownik ma prawo usunąć zgłoszenie
    if (incident.user && incident.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Brak uprawnień" });
    }

    await incident.remove();

    res.json({ msg: "Zgłoszenie usunięte" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
