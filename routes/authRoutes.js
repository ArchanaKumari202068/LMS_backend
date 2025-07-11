const express = require("express");
const passport = require("passport");
const { signup, login, sendWelcome } = require("../controllers/authControllers");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Local
router.post("/signup", signup);
router.post("/login", login);
router.post("/send-welcome-email", sendWelcome);

// Protected examples
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.get("/admin-only", verifyToken, isAdmin, (req, res) => {
  res.json({ msg: "This is an admin-only route" });
});

//  Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    // Successful OAuth login, redirect to frontend
    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  }
);


router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "This is protected", user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  req.logout?.(); 
  res.json({ message: "Logged out" });
});
module.exports = router;
