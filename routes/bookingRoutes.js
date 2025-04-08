const express = require("express");
const {
  createBooking,
  cancelBooking,
  getUserBookings,
} = require("../controller/bookingController");

const router = express.Router();

// Create a new booking with payment
router.post("/", createBooking);

// Cancel a booking
router.delete("/:bookingId", cancelBooking);

// Get all bookings for a user
router.get("/user/:userId", getUserBookings);

module.exports = router;
