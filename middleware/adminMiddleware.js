const User = require("../models/User");

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
