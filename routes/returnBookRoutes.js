const express = require("express");
const router = express.Router();
const IssuedBook = require("../models/IssuedBook");
const AdminSettings = require("../models/AdminSettings");
const Fine = require("../models/Fine");
const User = require("../models/User");

router.post("/return/:id", async (req, res) => {
  const issuedBook = await IssuedBook.findById(req.params.id).populate("user");
  const settings = await AdminSettings.findOne();

  const rule = settings.issuePricing[issuedBook.duration];
  const deduction = (issuedBook.usedAdvanceAtIssue * rule.deductionPercent) / 100;

  issuedBook.status = "returned";
  issuedBook.fine = deduction;
  await issuedBook.save();

  issuedBook.user.advanceBalance -= deduction;
  await issuedBook.user.save();

  await Fine.create({
    user: issuedBook.user._id,
    issuedBook: issuedBook._id,
    amount: deduction
  });

  res.json({ success: true, deduction });
});

module.exports = router;
