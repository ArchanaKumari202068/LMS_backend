const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
  issuePricing: {
    days15: {
      price: { type: Number, required: true },
      deductionPercent: { type: Number, required: true }
    },
    month1: {
      price: { type: Number, required: true },
      deductionPercent: { type: Number, required: true }
    },
    month2: {
      price: { type: Number, required: true },
      deductionPercent: { type: Number, required: true }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
