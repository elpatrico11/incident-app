const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAsUnread,
} = require("../controllers/notificationsController");
const authMiddleware = require("../middlewares/auth");

// Apply authentication middleware to all routes in this router
router.use(authMiddleware);

//Get all notifications for the logged-in user

router.get("/", getNotifications);

//Mark a notification as read

router.put("/:id/read", markAsRead);

//Mark a notification as unread

router.put("/:id/unread", markAsUnread);

module.exports = router;
