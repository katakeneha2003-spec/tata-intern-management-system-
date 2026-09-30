const Notification = require("../models/Notification");

/**
 * Small helper used by controllers to create a notification without
 * repeating boilerplate. Failures are logged but never block the
 * main request/response cycle.
 */
const notify = async ({ user, title, message, type = "general", link = "" }) => {
  try {
    await Notification.create({ user, title, message, type, link });
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

module.exports = notify;
