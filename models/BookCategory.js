const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // e.g., Fiction
}, { timestamps: true });

module.exports = mongoose.model("BookCategory", categorySchema);
