const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/rateLimiter");

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{12,}$/;

// Apply authLimiter to all auth routes
router.use(authLimiter);

// Registration Route - UNPROTECTED
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please provide a valid email").isEmail(),
    check(
      "password",
      "Hasło musi mieć co najmniej 12 znaków, zawierać małe i duże litery oraz cyfry (polskie znaki nie są dozwolone)"
    )
      .isLength({ min: 12 })
      .matches(passwordRegex),
    check("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Invalid role."),
    check("captcha", "reCAPTCHA token is required").not().isEmpty(), // Validate captcha
  ],
  authController.register
);

// Login Route - UNPROTECTED
router.post(
  "/login",
  [
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Hasło jest wymagane").exists(),
    check("rememberMe").optional().isBoolean(),
  ],
  authController.login
);

// Email Verification Route - UNPROTECTED
router.get("/verify-email", authController.verifyEmail);

// Resend Verification Email - UNPROTECTED
router.post(
  "/resend-verification",
  [check("email", "Please provide a valid email").isEmail()],
  authController.resendVerification
);

// Forgot Password Route - UNPROTECTED
router.post(
  "/forgot-password",
  [check("email", "Please provide a valid email").isEmail()],
  authController.forgotPassword
);

// Change Password Route - PROTECTED
router.post(
  "/change-password",
  authMiddleware,
  [
    check("oldPassword", "Stare hasło jest wymagane").exists(),
    check("newPassword", "Nowe hasło musi mieć co najmniej 6 znaków").isLength({
      min: 6,
    }),
    check("confirmNewPassword", "Potwierdzenie hasła jest wymagane").exists(),
  ],
  authController.changePassword
);

// Get Logged-in User Data - PROTECTED (Excluded from rate limiting)
router.get("/me", authMiddleware, authController.getMe);

// Update User Profile - PROTECTED
router.put("/me", authMiddleware, authController.updateProfile);

// Create Initial Admin (Optional) - UNPROTECTED
router.post("/create-admin", authController.createAdmin);

module.exports = router;
