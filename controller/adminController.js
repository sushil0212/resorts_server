/* const User = require("../models/User");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE a user by ID (admin only)
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res
      .status(500)
      .json({ message: "Error deleting user", error: err.message });
  }
};

module.exports = {
  getUsers,
  deleteUser, // ← new export
}; */

/* module.exports = { getUsers }; */

/* const User = require("../models/User");

// Get all users (admin panel)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(400)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// Optional: Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res
      .status(400)
      .json({ message: "Error deleting user", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
 */

const User = require("../models/User");

// Get all users (admin panel)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res
      .status(400)
      .json({ message: "Error fetching users", error: err.message });
  }
};

// Optional: Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res
      .status(400)
      .json({ message: "Error deleting user", error: err.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
