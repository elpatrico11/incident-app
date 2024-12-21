// server/routes/auth.js

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
const { check, validationResult } = require("express-validator");

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
    check("rememberMe").optional().isBoolean(), // Validate rememberMe
    check("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Invalid role."), // Ensure role is valid if provided
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, rememberMe } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Create new user
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || "user", // Default role is 'user'
      });

      // Save user to the database
      await user.save();

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

// Login Route - UNPROTECTED
router.post(
  "/login",
  [
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password is required").exists(),
    check("rememberMe").optional().isBoolean(), // Validate rememberMe
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return validation errors
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        console.log("User not found with email:", email); // Logging
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log("Invalid password for user:", email); // Logging
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
  const { firstName, lastName, email, password, rememberMe } = req.body;

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

    // Set token expiration based on rememberMe (default to 7 days for admin)
    const expiresIn = rememberMe ? "7d" : "1h";

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
