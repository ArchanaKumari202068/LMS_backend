const mongoose = require("mongoose");

const adminSettingsSchema = new mongoose.Schema({
  maxIssueDays: { type: Number, default: 14 },         // days a book can be borrowed
  finePerDay: { type: Number, default: 2 },             // fine for each extra day
  maxBooksPerUser: { type: Number, default: 3 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
}, { timestamps: true });

module.exports = mongoose.model("AdminSettings", adminSettingsSchema);
