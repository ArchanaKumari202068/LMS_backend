const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  library: { type: mongoose.Schema.Types.ObjectId, ref: "Library", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
