const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");

// Middleware: auth + authorize admin
router.use(authMiddleware, authorize("admin"));

//Pobranie wszystkich użytkowników

router.get("/users", adminController.getAllUsers);

//Pobranie pojedynczego użytkownika

router.get("/users/:id", adminController.getUserById);

//Aktualizacja użytkownika (np. zmiana roli)

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Delegate to controller
    adminController.updateUser(req, res, next);
  }
);

//Usunięcie użytkownika

router.delete("/users/:id", adminController.deleteUser);

//Pobranie wszystkich zgłoszeń z opcjonalnym filtrowaniem

router.get("/incidents", adminController.getAllIncidents);

//Zmiana statusu zgłoszenia

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    // Delegate to controller
    adminController.updateIncidentStatus(req, res, next);
  }
);

//Usunięcie zgłoszenia

router.delete("/incidents/:id", adminController.deleteIncident);

//Pobranie raportów jako CSV

router.get("/download", adminController.downloadReports);

// Pobranie raportów administracyjnych

router.get("/reports", adminController.getReports);

module.exports = router;
