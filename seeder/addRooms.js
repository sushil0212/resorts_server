const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Room = require("../models/Room"); // Adjust path if needed

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

const addRooms = async () => {
  try {
    await Room.deleteMany(); // Deletes all existing rooms
    console.log("Existing rooms removed!");

    const rooms = [
      {
        name: "Deluxe Room",
        type: "Deluxe",
        description: "A spacious room with a sea view.",
        price: 150,
        available: true,
        image: "https://example.com/deluxe-room.jpg",
      },
      {
        name: "Suite Room",
        type: "Suite",
        description: "Luxury suite with a jacuzzi.",
        price: 500,
        available: true,
        image: "https://example.com/suite-room.jpg",
      },
    ];

    await Room.insertMany(rooms);
    console.log("Rooms added successfully!");
    process.exit();
  } catch (error) {
    console.error("Error adding rooms:", error);
    process.exit(1);
  }
};

addRooms();
