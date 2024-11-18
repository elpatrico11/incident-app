// server/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Rejestracja użytkownika
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

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
    });

    await user.save();

    // Tworzenie tokenu JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

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
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

// Pobieranie danych zalogowanego użytkownika
const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Błąd serwera");
  }
});

module.exports = router;
