const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
const { check, validationResult } = require("express-validator");

// Wczytanie zmiennych środowiskowych
dotenv.config();

// Rejestracja użytkownika - trasa NIE CHRONIONA
router.post(
  "/register",
  [
    check("firstName", "Imię jest wymagane").not().isEmpty(),
    check("lastName", "Nazwisko jest wymagane").not().isEmpty(),
    check("email", "Proszę podać poprawny adres email").isEmail(),
    check("password", "Hasło musi mieć przynajmniej 6 znaków").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    // Sprawdzenie błędów walidacji
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Zwrócenie błędów walidacji
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role } = req.body;

    try {
      // Sprawdzenie, czy użytkownik już istnieje
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "Użytkownik już istnieje" });
      }

      // Tworzenie nowego użytkownika
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || "user", // Jeśli rola nie jest podana, ustawiamy na 'user'
      });

      // Zapisanie użytkownika do bazy danych
      await user.save();

      // Tworzenie payloadu dla JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role, // Dodajemy rolę do payload
        },
      };

      // Signowanie tokenu JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        async (err, token) => {
          if (err) throw err;
          // Pobranie danych użytkownika bez hasła
          const userData = await User.findById(user.id).select("-password");
          res.json({ token, user: userData }); // Zwraca token i dane użytkownika
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

// Logowanie użytkownika - trasa NIE CHRONIONA
router.post(
  "/login",
  [
    check("email", "Proszę podać poprawny adres email").isEmail(),
    check("password", "Hasło jest wymagane").exists(),
  ],
  async (req, res) => {
    // Sprawdzenie błędów walidacji
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Zwrócenie błędów walidacji
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Sprawdzenie, czy użytkownik istnieje
      let user = await User.findOne({ email });
      if (!user) {
        console.log("Nie znaleziono użytkownika o podanym emailu:", email); // Logowanie
        return res.status(400).json({ msg: "Nieprawidłowe dane logowania" });
      }

      // Sprawdzenie hasła
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log("Nieprawidłowe hasło dla użytkownika:", email); // Logowanie
        return res.status(400).json({ msg: "Nieprawidłowe dane logowania" });
      }

      // Tworzenie payloadu dla JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role, // Dodajemy rolę do payload
        },
      };

      // Signowanie tokenu JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        async (err, token) => {
          if (err) throw err;
          // Pobranie danych użytkownika bez hasła
          const userData = await User.findById(user.id).select("-password");
          res.json({ token, user: userData }); // Zwraca token i dane użytkownika
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Błąd serwera");
    }
  }
);

// Middleware autoryzacyjny
const authMiddleware = require("../middleware/auth");

// Pobieranie danych zalogowanego użytkownika - trasa CHRONIONA
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Aktualizacja profilu użytkownika - trasa CHRONIONA
router.put("/me", authMiddleware, async (req, res) => {
  const { firstName, lastName } = req.body;

  const updatedFields = {};
  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "Użytkownik nie znaleziony" });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Tworzenie początkowego administratora (opcjonalnie) - trasa NIE CHRONIONA
router.post("/create-admin", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let admin = await User.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: "Administrator już istnieje" });
    }

    admin = new User({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
    });

    // Zapisanie użytkownika do bazy danych (password będzie hashowane przez middleware)
    await admin.save();

    res.json({ msg: "Administrator utworzony pomyślnie" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
