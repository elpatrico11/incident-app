const express = require("express");
const router = express.Router();
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/auth");

// Tworzenie nowego zgłoszenia
router.post("/", authMiddleware, async (req, res) => {
  const { category, description, location, images } = req.body;

  try {
    const newIncident = new Incident({
      user: req.user.id,
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

// Pobieranie wszystkich zgłoszeń
router.get("/", authMiddleware, async (req, res) => {
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

// Pobieranie pojedynczego zgłoszenia
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

// Aktualizacja zgłoszenia
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
    if (incident.user.toString() !== req.user.id) {
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

// Usuwanie zgłoszenia
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
    }

    // Sprawdzenie, czy użytkownik ma prawo usunąć zgłoszenie
    if (incident.user.toString() !== req.user.id) {
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
