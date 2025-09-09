const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },

    isbn: { type: String, unique: true, sparse: true },
    qrCodeData: { type: String, unique: true, sparse: true },

    image: { type: String }, // Book cover / camera capture

    source: {
      type: String,
      enum: ["manual", "qr", "camera"],
      default: "manual",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookCategory",
      required: true,
    },

    quantity: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },

    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scannedAt: { type: Date },

    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);

