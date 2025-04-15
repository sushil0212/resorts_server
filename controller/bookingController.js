/* const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env

// Email Configuration for Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // 'sandbox.smtp.mailtrap.io'
  port: process.env.MAIL_PORT, // 2525 (or 25, 465, 587 if needed)
  auth: {
    user: process.env.MAIL_USER, // Mailtrap Username (e.g., c38e66e7edcd5a)
    pass: process.env.MAIL_PASS, // Mailtrap Password (e.g., 6d9771ca8421f5)
  },
  tls: {
    rejectUnauthorized: false, // To prevent TLS certificate errors
  },
});

// Create Booking with Payment
const createBooking = async (req, res) => {
  const { userId, roomId, startDate, endDate, totalPrice, paymentMethodId } =
    req.body;

  try {
    // Step 1: Validate Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Step 2: Check Availability
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

    // Step 3: Process Payment using Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert dollars to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed" });
    }

    // Step 4: Create Booking
    const booking = new Booking({
      userId,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: paymentIntent.id,
    });

    await booking.save();

    // Step 5: Mark Room as Unavailable
    room.available = false;
    await room.save();

    // Step 6: Send Booking Confirmation Email
    const user = await User.findById(userId);
    if (user) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Booking Confirmation",
          text: `Hello ${user.name},\n\nYour booking for ${room.name} is confirmed.\nTotal Price: $${totalPrice}\nFrom: ${startDate} to ${endDate}.\n\nThank you for choosing us!`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Mark Booking as "Cancelled"
    booking.status = "Cancelled";
    await booking.save();

    // Mark Room as Available Again
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.available = true;
      await room.save();
    }

    // Send Cancellation Email
    const user = await User.findById(booking.userId);
    if (user) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Booking Cancelled",
          text: `Hello ${user.name},\n\nYour booking for ${room.name} has been cancelled.\n\nSorry to see you go!`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res
      .status(500)
      .json({ message: "Error cancelling booking", error: err.message });
  }
};

// Get All Bookings for a User (This function was missing)
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

module.exports = { createBooking, cancelBooking, getUserBookings };

 */

/* const Booking = require("../models/Booking");
const Room = require("../models/Room");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env

// Email Configuration for Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // 'sandbox.smtp.mailtrap.io'
  port: process.env.MAIL_PORT, // 2525 (or 25, 465, 587 if needed)
  auth: {
    user: process.env.MAIL_USER, // Mailtrap Username (e.g., c38e66e7edcd5a)
    pass: process.env.MAIL_PASS, // Mailtrap Password (e.g., 6d9771ca8421f5)
  },
  tls: {
    rejectUnauthorized: false, // To prevent TLS certificate errors
  },
});

// Create Booking with Payment
const createBooking = async (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalPrice,
    paymentMethodId,
    clientDetails, // <-- Add clientDetails to the request
  } = req.body;

  try {
    // Step 1: Validate Room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Step 2: Check Availability
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

    // Step 3: Process Payment using Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Convert dollars to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ message: "Payment failed" });
    }

    // Step 4: Create Booking with Client Details
    const booking = new Booking({
      userId,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: paymentIntent.id,
      clientDetails, // <-- Save the client details
    });

    await booking.save();

    // Step 5: Mark Room as Unavailable
    room.available = false;
    await room.save();

    // Step 6: Send Booking Confirmation Email
    const user = await User.findById(userId);
    if (user) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Booking Confirmation",
          text: `Hello ${user.name},\n\nYour booking for ${room.name} is confirmed.\nTotal Price: $${totalPrice}\nFrom: ${startDate} to ${endDate}.\n\nThank you for choosing us!`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (err) {
    console.error("Error creating booking:", err);
    res
      .status(500)
      .json({ message: "Error creating booking", error: err.message });
  }
};

// Cancel Booking
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Mark Booking as "Cancelled"
    booking.status = "Cancelled";
    await booking.save();

    // Mark Room as Available Again
    const room = await Room.findById(booking.roomId);
    if (room) {
      room.available = true;
      await room.save();
    }

    // Send Cancellation Email
    const user = await User.findById(booking.userId);
    if (user) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Booking Cancelled",
          text: `Hello ${user.name},\n\nYour booking for ${room.name} has been cancelled.\n\nSorry to see you go!`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    res
      .status(200)
      .json({ message: "Booking cancelled successfully", booking });
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

module.exports = { createBooking, cancelBooking, getUserBookings };
 */

/* const Booking = require("../models/Booking");
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

// ✅ CREATE BOOKING WITH 3D SECURE SUPPORT
const createBooking = async (req, res) => {
  const {
    userId,
    roomId,
    startDate,
    endDate,
    totalPrice,
    paymentMethodId,
    clientDetails,
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

    const booking = new Booking({
      userId,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: paymentIntent.id,
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

// ✅ CANCEL BOOKING + REFUND
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Refund via Stripe (if paymentId exists)
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

// ✅ GET USER BOOKINGS
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

module.exports = {
  createBooking,
  cancelBooking,
  getUserBookings,
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
    paymentMethodId, // In the 3D Secure flow, this may not be used
    clientDetails,
    paymentIntentId, // Use this if provided by PaymentPage after confirming payment
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

    // If PaymentIntentId is provided, assume payment has been confirmed via 3D Secure
    if (!paymentIntentId) {
      // Create PaymentIntent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalPrice * 100,
        currency: "usd",
        payment_method: paymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      });

      // If further authentication is needed, return clientSecret
      if (paymentIntent.status === "requires_action") {
        return res.status(200).json({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment failed" });
      }
    }

    // At this point, either paymentIntentId was provided OR payment succeeded above.
    const booking = new Booking({
      userId,
      roomId,
      startDate,
      endDate,
      totalPrice,
      status: "Confirmed",
      paymentId: paymentIntentId || paymentIntent.id, // Use the confirmed payment id
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

module.exports = { createBooking, cancelBooking, getUserBookings };
