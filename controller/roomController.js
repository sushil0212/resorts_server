/* const Room = require("../models/Room");
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

    // Validation
    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Date conversion
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    // Validate date order
    if (newStart >= newEnd) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Check room existence
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Find overlapping bookings (CORRECTED QUERY)
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

module.exports = { getRooms, checkAvailability, getRoomById };
 */

/* const Room = require("../models/Room");
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
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json({ message: "Room added successfully", room: newRoom });
  } catch (err) {
    console.error("Add room error:", err);
    res.status(500).json({ message: "Error adding room" });
  }
};

module.exports = {
  getRoomById,
  getRooms,
  checkAvailability,
  addRoom, // ✅ Export this
}; */

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

// ✅ Updated with logging and number parsing
const addRoom = async (req, res) => {
  try {
    console.log("Incoming room data:", req.body);

    const { name, type, description, price, image } = req.body;

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
  } catch (err) {
    console.error("Add room error:", err);
    res.status(500).json({ message: "Error adding room" });
  }
};

module.exports = {
  getRoomById,
  getRooms,
  checkAvailability,
  addRoom,
};
