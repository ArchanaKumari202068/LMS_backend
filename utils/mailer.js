
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendWelcomeEmail = async (to, name = "") => {
  await transporter.sendMail({
    from: `"Gyaniz LMS" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to Gyaniz LMS",
    text: `Hi ${name}, Welcome! We're glad you joined us 🚀`,
  });
};
