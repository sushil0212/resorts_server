// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const { getUsers, deleteUser } = require("../controller/adminController");
const {
  deleteBookingHistory,
  cancelBooking,
} = require("../controller/bookingController");

// GET all users
// GET  /api/admin/users
router.get("/users", authMiddleware, adminMiddleware, getUsers);

// DELETE a user
// DELETE  /api/admin/users/:userId
router.delete("/users/:userId", authMiddleware, adminMiddleware, deleteUser);

// PUT /api/admin/bookings/:bookingId/cancel
// Admin cancels booking (refund + mark cancelled)
router.put(
  "/bookings/:bookingId/cancel",
  authMiddleware,
  adminMiddleware,
  cancelBooking
);

// DELETE a booking record
// DELETE  /api/admin/bookings/:bookingId
router.delete(
  "/bookings/:bookingId",
  authMiddleware,
  adminMiddleware,
  deleteBookingHistory
);

module.exports = router;
