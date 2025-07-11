const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Protected route", user: req.user });
});

router.get("/admin", verifyToken, verifyAdmin, (req, res) => {
  res.json({ message: "Admin-only route", user: req.user });
});

module.exports = router;
