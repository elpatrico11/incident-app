// middleware/auth.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

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
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    console.log("Decoded token in auth middleware:", decoded); // Debugging
    req.user = decoded.user; // { id: user.id, role: user.role }
    console.log("Authenticated user in auth middleware:", req.user); // Debugging
    next();
  } catch (err) {
    console.error("Invalid token in auth middleware");
    res.status(401).json({ msg: "Token nieprawidłowy" });
  }
};
