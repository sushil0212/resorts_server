/* const express = require("express");
const Booking = require("../models/Booking");
const router = express.Router();

router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId").populate("roomId");
    res.json(bookings);
  } catch (err) {
    res.status(500).send("Error fetching bookings");
  }
});

module.exports = router;
 */

/* const express = require("express");
const router = express.Router();

// Dummy admin route to prevent route errors
router.get("/", (req, res) => {
  res.send("Admin routes");
});

module.exports = router;
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getUsers } = require("../controller/adminController");

router.get("/users", authMiddleware, adminMiddleware, getUsers);

module.exports = router;
