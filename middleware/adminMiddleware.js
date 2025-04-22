/* const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminMiddleware;
 */

const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id; // ✅ Handle both "id" or "_id"
    const user = await User.findById(userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminMiddleware;
