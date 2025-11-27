// models/IssuedBook.js
const mongoose = require("mongoose");

const issuedBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: Date,
  status: { type: String, enum: ['issued','returned','overdue','lost'], default: 'issued' },

  // payments made at issue time
  paidAtIssue: { type: Number, default: 0 },     // amount user paid at issue (not advance)
  usedAdvanceAtIssue: { type: Number, default: 0 }, // amount deducted from advanceBalance
  fine: { type: Number, default: 0 } // calculated at return
});
module.exports = mongoose.model("IssuedBook", issuedBookSchema);
