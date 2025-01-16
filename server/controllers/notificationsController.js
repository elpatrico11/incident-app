const Notification = require("../models/Notification");

//Get all notifications for the logged-in user

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("relatedIncident", ["category", "status"]);

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

//Mark a notification as read

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Ensure the notification belongs to the logged-in user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Notification not found" });
    }
    next(err);
  }
};

//Mark a notification as unread

const markAsUnread = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Ensure the notification belongs to the logged-in user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    notification.isRead = false;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Notification not found" });
    }
    next(err);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAsUnread,
};
