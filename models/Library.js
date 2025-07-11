const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Gyaniz Patna"
  address: String,
  city: String,
  state: String,
  pincode: String,
});

module.exports = mongoose.model("Library", librarySchema);
