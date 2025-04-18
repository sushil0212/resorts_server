// controller/roomController.js
const Room = require("../models/Room");
const Booking = require("../models/Booking");

const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (err) {
    console.error("Room fetch error:", err);
    res.status(500).json({ message: "Error fetching room details" });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ price: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Rooms fetch error:", err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    if (newStart >= newEnd) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const existingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lt: newEnd },
          endDate: { $gt: newStart },
        },
      ],
    });

    res.json({
      available: !existingBooking,
      message: existingBooking
        ? "Room is booked for selected dates"
        : "Room is available",
      roomDetails: {
        name: room.name,
        price: room.price,
        image: room.image,
      },
    });
  } catch (err) {
    console.error("Availability check error:", err);
    res.status(500).json({ message: "Server error during availability check" });
  }
};

const addRoom = async (req, res) => {
  try {
    console.log("Incoming room data:", req.body);

    const { name, type, description, price, image } = req.body;
    console.log("ROOM BODY RECEIVED:", req.body);

    if (!name || !type || !description || !price || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRoom = new Room({
      name,
      type,
      description,
      price: Number(price),
      image,
    });

    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({ message: "Error adding room" });
  }
};

// New: Update room details
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room updated successfully", room });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating room", error: err.message });
  }
};

// New: Delete a room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting room", error: err.message });
  }
};

module.exports = {
  getRoomById,
  getRooms,
  checkAvailability,
  addRoom,
  updateRoom,
  deleteRoom,
};
