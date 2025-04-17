const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controller/authController"); // ✅ Correct path
const authMiddleware = require("../middleware/authMiddleware"); // 🚨 Fix casing here

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
