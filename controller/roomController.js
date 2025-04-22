/* // controller/roomController.js
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
 */
/* const Room = require("../models/Room");
const Booking = require("../models/Booking");

// ✅ Get a single room by ID
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

// ✅ Get all rooms with search and sort
const getRooms = async (req, res) => {
  try {
    const { search, sort } = req.query;

    let filter = {};

    // Search by name or type (case-insensitive)
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
        ],
      };
    }

    let sortOption = {};
    if (sort === "asc") {
      sortOption.price = 1; // Low to High
    } else if (sort === "desc") {
      sortOption.price = -1; // High to Low
    }

    const rooms = await Room.find(filter).sort(sortOption);
    res.status(200).json(rooms);
  } catch (err) {
    console.error("Rooms fetch error:", err);
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

// ✅ Check availability
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

// ✅ Add a new room (Admin only)
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

// ✅ Update a room (Admin only)
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

// ✅ Delete a room (Admin only)
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
 */

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

// 🔥 GET ROOMS WITH ADVANCED FILTERS
const getRooms = async (req, res) => {
  try {
    const { search, sort, type, available, startDate, endDate } = req.query;

    let filter = {};

    // 🔍 Search by name or type
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    // 🏷️ Filter by type
    if (type) {
      filter.type = type;
    }

    // 🏨 Get all rooms first
    let rooms = await Room.find(filter);

    // 📅 Filter by availability (optional)
    if (available === "true" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const bookedRoomIds = await Booking.find({
        $or: [
          {
            startDate: { $lt: end },
            endDate: { $gt: start },
          },
        ],
      }).distinct("roomId");

      rooms = rooms.filter(
        room => !bookedRoomIds.includes(room._id.toString())
      );
    }

    // 💰 Sort by price
    if (sort === "asc") {
      rooms.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      rooms.sort((a, b) => b.price - a.price);
    }

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
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({ message: "Error adding room" });
  }
};

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
