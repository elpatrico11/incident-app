const rateLimit = require("express-rate-limit");

// Define a general rate limiter (e.g., for all requests)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Define a stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  message: {
    msg: "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limiting for GET /me
    return req.method === "GET" && req.path === "/me";
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
