/* const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: '"Resort Booking" <no-reply@resortbooking.com>',
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
};

module.exports = sendOTPEmail;
 */

// utils/sendEmail.js
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: `"Resort Booking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
}

module.exports = sendEmail;
