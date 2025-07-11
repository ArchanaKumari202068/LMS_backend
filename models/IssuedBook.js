// models/IssuedBook.js
const mongoose = require("mongoose");

const issuedBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  issuedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedDate: { type: Date },
  isReturned: { type: Boolean, default: false },
  fine: { type: Number, default: 0 }, // optional
}, { timestamps: true });

module.exports = mongoose.model("IssuedBook", issuedBookSchema);
