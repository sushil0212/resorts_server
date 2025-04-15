/* const express = require('express');
const { getRooms, checkAvailability } = require('../controller/roomController');
const router = express.Router();

router.get('/', getRooms);
router.post('/check-availability', checkAvailability);

module.exports = router;
 */

const express = require("express");
const router = express.Router();

const {
  getRooms,
  checkAvailability,
  getRoomById,
  addRoom, // ✅ New controller to add
} = require("../controller/roomController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Get all rooms
router.get("/", getRooms);

// Get a single room by ID
router.get("/:id", getRoomById);

// Check room availability
router.post("/check-availability", checkAvailability);

// ✅ Add a new room (Admin only)
router.post("/", authMiddleware, adminMiddleware, addRoom);

module.exports = router;
