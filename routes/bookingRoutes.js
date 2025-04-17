// routes/bookingRoutes.js
const express = require("express");
const {
  createBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
} = require("../controller/bookingController");

const router = express.Router();

// Create a new booking with payment
router.post("/", createBooking);

// Cancel a booking
router.delete("/:bookingId", cancelBooking);

// Get all bookings for a user (by userId)
router.get("/user/:userId", getUserBookings);

// New: Get all bookings (for admin)
router.get(
  "/",
  require("../middleware/authMiddleware"),
  require("../middleware/adminMiddleware"),
  getAllBookings
);

module.exports = router;
