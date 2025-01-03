const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationsController");
const authMiddleware = require("../middlewares/auth");

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get("/", getNotifications);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put("/:id/read", markAsRead);

module.exports = router;
