// models/Fine.js
const mongoose = require("mongoose");

const fineSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  issuedBook: { type: mongoose.Schema.Types.ObjectId, ref: "IssuedBook" },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Fine", fineSchema);
