const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  // Sprawdzenie, czy token jest obecny
  if (!token) {
    return res.status(401).json({ msg: "Brak tokenu, autoryzacja odmówiona" });
  }

  try {
    // Token może być przesyłany jako "Bearer token"
    const splitToken = token.split(" ");
    const actualToken = splitToken[1] || splitToken[0];

    // Weryfikacja tokenu
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token nieprawidłowy" });
  }
};
