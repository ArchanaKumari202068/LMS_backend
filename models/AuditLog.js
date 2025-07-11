const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // e.g., "Add Book", "Delete Library"
  targetModel: { type: String },           // e.g., "Book", "User", "Library"
  targetId: { type: mongoose.Schema.Types.ObjectId },
  description: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
