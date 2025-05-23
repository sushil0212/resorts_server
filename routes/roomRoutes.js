// routes/roomRoutes.js
const express = require("express");
const router = express.Router();

const {
  getRooms,
  checkAvailability,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../controller/roomController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Get all rooms
router.get("/", getRooms);

// Get a single room by ID
router.get("/:id", getRoomById);

// Check room availability
router.post("/check-availability", checkAvailability);

// Add a new room (Admin only)
router.post("/", authMiddleware, adminMiddleware, addRoom);

// Update a room (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, updateRoom);

// Delete a room (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, deleteRoom);

module.exports = router;
