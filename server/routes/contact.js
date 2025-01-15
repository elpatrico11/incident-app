const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../services/emailService");

router.post("/", async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane." });
    }

    await sendContactEmail(name, email, subject, message);
    res.status(200).json({ message: "Wiadomość została wysłana pomyślnie." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
