const express = require("express");
const { OAuth2Client } = require("google-auth-library"); // import properly
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // add User model
const {
  signup,
  login,
  sendWelcome,
  googleLogin,
  logout,
} = require("../controllers/authControllers");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// -------------------- Local Auth --------------------
router.post("/signup", signup);
router.post("/login", login);
router.post("/send-welcome-email", sendWelcome);
router.post("/logout", logout);

// -------------------- Protected Routes --------------------
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.get("/admin-only", verifyToken, isAdmin, (req, res) => {
  res.json({ msg: "This is an admin-only route" });
});

// -------------------- Google Login --------------------
router.post("/auth/google", googleLogin); // ✅ delegate to controller

module.exports = router;
