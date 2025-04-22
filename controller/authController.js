/* // controller/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "User exists" });

    // Set admin role if email matches; otherwise, default to user
    const role = email === "sudhirstar9@gmail.com" ? "admin" : "user";

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe };
 */

/* const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOTPEmail = require("../utils/sendEmail");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (user) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    } else {
      const role = email === "star9@gmail.com" ? "admin" : "user";
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        otp,
        otpExpiresAt,
      });
    }

    await sendOTPEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiresAt < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res
        .status(400)
        .json({ message: "Account not verified or invalid" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe, verifyOtp };
 */

// controller/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── 1) REGISTER → send OTP ─────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Hash password (for later login)
    const hashed = await bcrypt.hash(password, 10);

    // Find or create user record
    let user = await User.findOne({ email });
    if (user && user.verified) {
      return res.status(400).json({ message: "User already verified." });
    }

    // Generate OTP + expiry
    const otp = generateOtp();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    if (user) {
      // Update existing unverified user
      user.name = name;
      user.password = hashed;
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
    } else {
      // Create new user
      const role = email === "sushilstar9@gmail.com" ? "admin" : "user";
      user = new User({
        name,
        email,
        password: hashed,
        role,
        otp,
        otpExpiresAt,
      });
    }
    await user.save();

    // Send OTP via Gmail SMTP
    await sendEmail(
      email,
      "Your ResortApp OTP Code",
      `Hello ${name},\n\nYour OTP is ${otp}. It expires in 5 minutes.`
    );

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 2) VERIFY OTP ─────────────────────────
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 3) RESEND OTP ─────────────────────────
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verified)
      return res.status(400).json({ message: "Already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmail(
      email,
      "Your ResortApp OTP Code (Resent)",
      `Your new OTP is ${otp}. It expires in 5 minutes.`
    );

    res.json({ message: "OTP resent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 4) LOGIN (only if verified) ──────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified) {
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 5) GET ME ─────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
