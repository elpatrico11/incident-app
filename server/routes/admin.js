const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Incident = require("../models/Incident");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { check, validationResult } = require("express-validator");

// Middleware: auth + authorize admin
router.use(authMiddleware, authorize("admin"));

/**
 * @route   GET /api/admin/users
 * @desc    Pobranie wszystkich użytkowników
 * @access  Admin
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Pobranie pojedynczego użytkownika
 * @access  Admin
 */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }
    res.status(500).send("Błąd serwera");
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Aktualizacja użytkownika (np. zmiana roli)
 * @access  Admin
 */
router.put(
  "/users/:id",
  [
    check("firstName")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Imię nie może być puste"),
    check("lastName")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Nazwisko nie może być puste"),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Nieprawidłowy adres email"),
    check("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Nieprawidłowa rola"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, role } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;

    try {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
      }

      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password");

      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Usunięcie użytkownika
 * @access  Admin
 */
router.delete("/users/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony." });
    }

    // Sprawdzenie, czy admin próbuje usunąć swoje własne konto
    if (user.id === req.user.id) {
      return res
        .status(400)
        .json({ msg: "Nie możesz usunąć swojego własnego konta." });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "Użytkownik usunięty." });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony." });
    }
    res.status(500).send("Błąd serwera");
  }
});

/**
 * @route   GET /api/admin/incidents
 * @desc    Pobranie wszystkich zgłoszeń z opcjonalnym filtrowaniem
 * @access  Admin
 */
router.get("/incidents", async (req, res) => {
  try {
    const { status, category } = req.query;
    let filter = {};

    if (status && status !== "All") {
      filter.status = status;
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    const incidents = await Incident.find(filter).populate("user", [
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

/**
 * @route   PUT /api/admin/incidents/:id/status
 * @desc    Zmiana statusu zgłoszenia
 * @access  Admin
 */
router.put(
  "/incidents/:id/status",
  [
    check("status")
      .isIn(["Pending", "In Progress", "Resolved"])
      .withMessage("Nieprawidłowy status"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      let incident = await Incident.findById(req.params.id).populate("user", [
        "firstName",
        "lastName",
        "email",
      ]);

      if (!incident) {
        return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
      }

      incident.status = status;
      await incident.save();

      // Opcjonalnie: Wysyłanie powiadomienia email o zmianie statusu

      res.json(incident);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

/**
 * @route   DELETE /api/admin/incidents/:id
 * @desc    Usunięcie zgłoszenia
 * @access  Admin
 */
router.delete("/incidents/:id", async (req, res) => {
  try {
    let incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ msg: "Zgłoszenie nie znalezione" });
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
});

/**
 * @route   GET /api/admin/reports
 * @desc    Pobranie danych raportowych
 * @access  Admin
 */
router.get("/reports", async (req, res) => {
  try {
    // Przykład: Liczba zgłoszeń według statusu
    const statusCount = await Incident.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Przykład: Liczba zgłoszeń według kategorii
    const categoryCount = await Incident.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.json({ statusCount, categoryCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
