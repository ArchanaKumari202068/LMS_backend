require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

//  Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
//  Helper

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

//  signup
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log("Checking user:", email);
  const exists = await User.findOne({ email });
  console.log("Exists:", exists);
  if (exists) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role });
  await user.save();

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome!",
    text: `Hi ${name || ""}, Welcome to Gyaniz!`,
  });

  res.status(201).json({
    message: "User created",
    user: { id: user._id, email: user.email, role: user.role },
  });
};

// login

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = createToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Login successful",
    user: { id: user._id, email: user.email, role: user.role },
  });
};

//  sendWelcome
const sendWelcome = async (req, res) => {
  const { to } = req.body;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Welcome to Gyaniz!",
      text: "Thanks for signing up!",
    });
    res.json({ message: "Welcome email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send welcome email" });
  }
};

//  Export properly
module.exports = {
  signup,
  login,
  sendWelcome,
};
