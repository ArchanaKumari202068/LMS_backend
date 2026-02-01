const express = require("express");
const router = express.Router();
const IssuedBook = require("../models/IssuedBook");
const AdminSettings = require("../models/AdminSettings");
const User = require("../models/User");
const Book = require("../models/Book");

router.post("/issue", async (req, res) => {
  const { userId, bookId, duration } = req.body;

  const user = await User.findById(userId);
  const book = await Book.findById(bookId);
  const settings = await AdminSettings.findOne();

  const rule = settings.issuePricing[duration];

  let usedAdvance = Math.min(user.advanceBalance, book.price);
  let paidNow = book.price - usedAdvance;

  user.advanceBalance -= usedAdvance;

  const dueDate = new Date();
  if (duration === "days15") dueDate.setDate(dueDate.getDate() + 15);
  if (duration === "month1") dueDate.setMonth(dueDate.getMonth() + 1);
  if (duration === "month2") dueDate.setMonth(dueDate.getMonth() + 2);

  const issued = await IssuedBook.create({
    user: userId,
    book: bookId,
    duration,
    dueDate,
    paidAtIssue: paidNow,
    usedAdvanceAtIssue: usedAdvance,
    status: "issued"
  });

  await user.save();

  res.json(issued);
});

module.exports = router;
