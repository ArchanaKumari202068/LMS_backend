const express = require("express");
const router = express.Router();
const AdminSettings = require("../models/AdminSettings");

// GET SETTINGS
router.get("/", async (req, res) => {
  let settings = await AdminSettings.findOne();

  if (!settings) {
    settings = await AdminSettings.create({
      issuePricing: {
        days15: { price: 200, deductionPercent: 2 },
        month1: { price: 500, deductionPercent: 5 },
        month2: { price: 900, deductionPercent: 10 }
      }
    });
  }

  res.json(settings);
});

// UPDATE SETTINGS
router.put("/", async (req, res) => {
  const updated = await AdminSettings.findOneAndUpdate(
    {},
    req.body,
    { new: true, upsert: true }
  );
  res.json(updated);
});

module.exports = router;
