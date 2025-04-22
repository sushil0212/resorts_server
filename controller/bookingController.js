/* // controller/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Create Booking with 3D Secure Support
const createBooking = async (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalPrice,
    paymentMethodId,
    clientDetails,
    paymentIntentId,
  } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const existingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Room is not available for the selected dates" });
    }

    let confirmedPaymentId = paymentIntentId;

    if (!paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      if (paymentIntent.status === "requires_action") {
        return res.status(200).json({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment failed" });
      }
      confirmedPaymentId = paymentIntent.id;
    }

    const booking = new Booking({
      userId,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: confirmedPaymentId,
      clientDetails,
    });

    await booking.save();

    room.available = false;
    await room.save();

    const user = await User.findById(userId);
    if (user) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Booking Confirmation",
        text: `Hello ${user.name},\n\nYour booking for ${room.name} is confirmed.\nFrom ${startDate} to ${endDate}, Total: $${totalPrice}.\n\nThank you!`,
      });
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// Cancel Booking with Refund
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentId) {
      await stripe.refunds.create({ payment_intent: booking.paymentId });
    }
    booking.status = "Cancelled";
    await booking.save();

    const room = await Room.findById(booking.roomId);
    if (room) {
      room.available = true;
      await room.save();
    }

    const user = await User.findById(booking.userId);
    if (user) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Booking Cancelled & Refunded",
        text: `Hi ${user.name},\n\nYour booking for ${room.name} was cancelled and your payment has been refunded.\n\nRegards.`,
      });
    }

    res
      .status(200)
      .json({ message: "Booking cancelled and refunded", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: err.message });
  }
};

// Get All Bookings for a User
const getUserBookings = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ userId }).populate("roomId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

// New: Get all bookings (for admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId").populate("userId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};
// New: Permanently delete a booking record (admin only)
const deleteBookingHistory = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking history deleted" });
  } catch (err) {
    console.error("Error deleting booking history:", err);
    res
      .status(500)
      .json({ message: "Error deleting booking history", error: err.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
  deleteBookingHistory, // ← new export
};
 */

/* // controller/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Create Booking with 3D Secure Support
const createBooking = async (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalPrice,
    paymentMethodId,
    clientDetails,
    paymentIntentId,
  } = req.body;

  try {
    // 1) Check room existence & availability
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const conflict = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
    });
    if (conflict) {
      return res
        .status(400)
        .json({ message: "Room is not available for the selected dates" });
    }

    // 2) Handle Stripe payment
    let confirmedPaymentId = paymentIntentId;
    if (!paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });
      if (paymentIntent.status === "requires_action") {
        return res.status(200).json({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        });
      }
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment failed" });
      }
      confirmedPaymentId = paymentIntent.id;
    }

    // 3) Fetch user for email snapshot
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4) Create booking record
    const booking = new Booking({
      userId,
      userEmail: user.email, // ← store email here
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: confirmedPaymentId,
      clientDetails,
    });
    await booking.save();

    // 5) Mark room unavailable
    room.available = false;
    await room.save();

    // 6) Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Confirmation",
      text: `Hello ${user.name},\n\nYour booking for ${room.name} is confirmed.\nFrom ${startDate} to ${endDate}, Total: $${totalPrice}.\n\nThank you!`,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// Cancel Booking with Refund
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentId) {
      await stripe.refunds.create({ payment_intent: booking.paymentId });
    }
    booking.status = "Cancelled";
    await booking.save();

    const room = await Room.findById(booking.roomId);
    if (room) {
      room.available = true;
      await room.save();
    }

    const user = await User.findById(booking.userId);
    if (user) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Booking Cancelled & Refunded",
        text: `Hi ${user.name},\n\nYour booking for ${room.name} was cancelled and your payment has been refunded.\n\nRegards.`,
      });
    }

    res
      .status(200)
      .json({ message: "Booking cancelled and refunded", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: err.message });
  }
};

// Get All Bookings for a User
const getUserBookings = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ userId }).populate("roomId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

// Get all bookings (for admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId").populate("userId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

// Permanently delete a booking record (admin only)
const deleteBookingHistory = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking history deleted" });
  } catch (err) {
    console.error("Error deleting booking history:", err);
    res
      .status(500)
      .json({ message: "Error deleting booking history", error: err.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
  deleteBookingHistory,
};
 */

// controller/bookingController.js
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Use the correct EMAIL_ env variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ✅ Booking controller functions

// Create Booking
const createBooking = async (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalPrice,
    paymentMethodId,
    clientDetails,
    paymentIntentId,
  } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const conflict = await Booking.findOne({
      roomId,
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
    });

    if (conflict) {
      return res.status(400).json({
        message: "Room is not available for the selected dates",
      });
    }

    // Stripe payment
    let confirmedPaymentId = paymentIntentId;
    if (!paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      if (paymentIntent.status === "requires_action") {
        return res.status(200).json({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment failed" });
      }

      confirmedPaymentId = paymentIntent.id;
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const booking = new Booking({
      userId,
      userEmail: user.email,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: confirmedPaymentId,
      clientDetails,
    });
    await booking.save();

    room.available = false;
    await room.save();

    // ✅ Email confirmation
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Booking Confirmation",
      text: `Hello ${user.name},\n\nYour booking for ${room.name} is confirmed.\nFrom ${startDate} to ${endDate}, Total: $${totalPrice}.\n\nThank you!`,
    });

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// Cancel Booking with Refund
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.paymentId) {
      await stripe.refunds.create({ payment_intent: booking.paymentId });
    }

    booking.status = "Cancelled";
    await booking.save();

    const room = await Room.findById(booking.roomId);
    if (room) {
      room.available = true;
      await room.save();
    }

    const user = await User.findById(booking.userId);
    if (user) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Booking Cancelled & Refunded",
        text: `Hi ${user.name},\n\nYour booking for ${room.name} was cancelled and your payment has been refunded.\n\nRegards.`,
      });
    }

    res
      .status(200)
      .json({ message: "Booking cancelled and refunded", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: err.message });
  }
};

// Get All Bookings for a User
const getUserBookings = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ userId }).populate("roomId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

// Get all bookings (for admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId").populate("userId");
    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: err.message });
  }
};

// Permanently delete a booking record (admin only)
const deleteBookingHistory = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking history deleted" });
  } catch (err) {
    console.error("Error deleting booking history:", err);
    res
      .status(500)
      .json({ message: "Error deleting booking history", error: err.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getUserBookings,
  getAllBookings,
  deleteBookingHistory,
};
