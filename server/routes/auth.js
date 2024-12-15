const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize"); // Importujemy authorize middleware
const dotenv = require("dotenv");

dotenv.config();

// Rejestracja użytkownika
router.post(
  "/register",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
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

      await user.save();

      // Tworzenie tokenu JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role, // Dodajemy rolę do payload
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        async (err, token) => {
          if (err) throw err;
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

// Logowanie użytkownika
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sprawdzenie, czy użytkownik istnieje
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Nieprawidłowe dane logowania" });
    }

    // Sprawdzenie hasła
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Nieprawidłowe dane logowania" });
    }

    // Tworzenie tokenu JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role, // Dodajemy rolę do payload
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      async (err, token) => {
        if (err) throw err;
        const userData = await User.findById(user.id).select("-password");
        res.json({ token, user: userData }); // Zwraca token i dane użytkownika
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie danych zalogowanego użytkownika
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Aktualizacja profilu użytkownika
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

// Tworzenie początkowego administratora (opcjonalnie)
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

    await admin.save();

    res.json({ msg: "Administrator utworzony pomyślnie" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
