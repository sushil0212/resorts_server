/* const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controller/authController"); // ✅ Correct path
const authMiddleware = require("../middleware/authMiddleware"); // 🚨 Fix casing here

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
 */

/* const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyOtp,
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
 */

// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", auth.register);
router.post("/verify-otp", auth.verifyOtp);
router.post("/resend-otp", auth.resendOtp);
router.post("/login", auth.login);
router.get("/me", authMiddleware, auth.getMe);

module.exports = router;
