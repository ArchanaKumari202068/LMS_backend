const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String },
    description: { type: String },

    isbn: { type: String, unique: true, default: null },
    qrCodeData: { type: String },

    image: { type: String }, // Book cover / camera capture

    source: {
      type: String,
      enum: ["manual", "qr", "camera", "isbn"],
      default: "manual",
    },

    category: {
      type: String,
      ref: "BookCategory",
      required: true,
    },

    quantity: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    value: { type: Number, default: 0 },

    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    scannedAt: { type: Date },

    available: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
