const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const dotenv = require("dotenv");
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");

// Load environment variables
dotenv.config();

// Registration Route - UNPROTECTED
router.post(
  "/register",
  [
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
    check("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Invalid role."),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      // Create new user with verification details
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || "user", // Default role is 'user'
        verificationToken,
        verificationTokenExpiry,
      });

      // Save user to the database
      await user.save();

      // Create verification URL
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${email}`;

      // Email content
      const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `;

      // Send verification email
      await sendEmail(email, "Email Verification", message);

      // Respond to client
      res.status(201).json({
        msg: "Registration successful. Please check your email to verify your account.",
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Login Route - UNPROTECTED
router.post(
  "/login",
  [
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password is required").exists(),
    check("rememberMe").optional().isBoolean(),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res
          .status(400)
          .json({ msg: "Please verify your email before logging in." });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Create payload for JWT
      const payload = {
        user: {
          id: user.id,
          role: user.role, // Include role in payload
        },
      };

      // Set token expiration based on rememberMe
      const expiresIn = rememberMe ? "7d" : "1h"; // 7 days vs 1 hour

      // Sign JWT
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn },
        async (err, token) => {
          if (err) throw err;
          // Fetch user data without password
          const userData = await User.findById(user.id).select("-password");
          res.json({ token, user: userData }); // Return token and user data
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Email Verification Route - UNPROTECTED
router.get("/verify-email", async (req, res) => {
  const { token, email } = req.query;
  console.log("Received verification request:", { token, email });

  if (!token || !email) {
    console.log("Missing token or email");
    return res.status(400).json({ msg: "Invalid verification link." });
  }

  try {
    // Find user with matching email and verification token OR already verified
    const user = await User.findOne({
      email,
      $or: [
        { verificationToken: token },
        { isVerified: true, verificationToken: null }, // Already verified case
      ],
    });

    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired verification link." });
    }

    // If user is already verified, just return success
    if (user.isVerified) {
      return res
        .status(200)
        .json({ msg: "Email already verified successfully." });
    }

    // Check if the verification token has expired
    if (user.verificationTokenExpiry < Date.now()) {
      return res.status(400).json({ msg: "Verification token has expired." });
    }

    // Update user to set isVerified to true and remove verificationToken and expiry
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    // Send success response
    res.status(200).json({ msg: "Email verified successfully." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post(
  "/resend-verification",
  [check("email", "Please provide a valid email").isEmail()],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "User not found." });
      }

      // Check if user is already verified
      if (user.isVerified) {
        return res.status(400).json({ msg: "Email is already verified." });
      }

      // Generate a new verification token and set expiry
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      // Update user with new token and expiry
      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = verificationTokenExpiry;
      await user.save();

      // Create verification URL
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${email}`;

      // Email content
      const message = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `;

      // Send verification email
      await sendEmail(email, "Email Verification", message);

      // Respond to client
      res
        .status(200)
        .json({ msg: "Verification email resent. Please check your email." });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Authorization Middleware
const authMiddleware = require("../middleware/auth");

// Get Logged-in User Data - PROTECTED
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update User Profile - PROTECTED
router.put("/me", authMiddleware, async (req, res) => {
  const { firstName, lastName } = req.body;

  const updatedFields = {};
  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;

  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Create Initial Admin (Optional) - UNPROTECTED
router.post("/create-admin", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    let admin = await User.findOne({ email });
    if (admin) {
      return res.status(400).json({ msg: "Administrator already exists" });
    }

    admin = new User({
      firstName,
      lastName,
      email,
      password,
      role: "admin",
    });

    // Save admin to the database (password will be hashed by middleware)
    await admin.save();

    // Create payload for JWT
    const payload = {
      user: {
        id: admin.id,
        role: admin.role, // Include role in payload
      },
    };

    // Set token expiration (default to 7 days for admin)
    const expiresIn = "7d";

    // Sign JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn },
      async (err, token) => {
        if (err) throw err;
        // Fetch admin data without password
        const adminData = await User.findById(admin.id).select("-password");
        res.json({ token, user: adminData }); // Return token and admin data
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
