// server/routes/incidents.js
const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const multer = require("multer");
const path = require("path");
const optionalAuth = require("../middleware/optionalAuth"); // Importowanie opcjonalnego middleware

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
const authMiddleware = require("../middleware/auth");

router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  const { category, description, location, images, status } = req.body;

  // Budowanie obiektu z polami do aktualizacji
  const incidentFields = {};
  if (category) incidentFields.category = category;
  if (description) incidentFields.description = description;
  if (location) incidentFields.location = location;
  if (images) incidentFields.images = images;
  if (status) incidentFields.status = status;

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

module.exports = router;
