const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

// Middleware: auth + authorize admin
router.use(authMiddleware, authorize("admin"));

/**
 * @route   GET /api/admin/users
 * @desc    Pobranie wszystkich użytkowników
 * @access  Admin
 */
router.get("/users", adminController.getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Pobranie pojedynczego użytkownika
 * @access  Admin
 */
router.get("/users/:id", adminController.getUserById);

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
  (req, res, next) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Delegate to controller
    adminController.updateUser(req, res, next);
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Usunięcie użytkownika
 * @access  Admin
 */
router.delete("/users/:id", adminController.deleteUser);

/**
 * @route   GET /api/admin/incidents
 * @desc    Pobranie wszystkich zgłoszeń z opcjonalnym filtrowaniem
 * @access  Admin
 */
router.get("/incidents", adminController.getAllIncidents);

/**
 * @route   PUT /api/admin/incidents/:id/status
 * @desc    Zmiana statusu zgłoszenia
 * @access  Admin
 */
router.put(
  "/incidents/:id/status",
  [
    check("status")
      .isIn([
        "Nowe",
        "Weryfikacja",
        "Potwierdzone",
        "Wstrzymane",
        "Eskalowane",
        "Rozwiązane",
        "Nierozwiązane",
        "Zamknięte",
        "Odrzucone",
      ])
      .withMessage("Nieprawidłowy status"),
  ],
  (req, res, next) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    // Delegate to controller
    adminController.updateIncidentStatus(req, res, next);
  }
);

/**
 * @route   DELETE /api/admin/incidents/:id
 * @desc    Usunięcie zgłoszenia
 * @access  Admin
 */
router.delete("/incidents/:id", adminController.deleteIncident);

/**
 * @route   GET /api/admin/download
 * @desc    Pobranie raportów jako CSV
 * @access  Admin
 */
router.get("/download", adminController.downloadReports);

/**
 * @route   GET /api/admin/reports
 * @desc    Pobranie raportów administracyjnych
 * @access  Admin
 */
router.get("/reports", adminController.getReports); // Newly added route

module.exports = router;
