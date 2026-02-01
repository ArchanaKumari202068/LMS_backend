const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isGoogle: { type: Boolean, default: false },

  phone : { type: String, default: null },
  address:{ type: String, default: null },
  
  // registration fee: non-refundable
  registrationFeePaid: { type: Boolean, default: false },
  registrationFeeAmount: { type: Number, default: 0 },

  // refundable advance/wallet - used toward book payments/fines
  walletBalance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  membershipLevel: { type: String, enum: ['standard','premium'], default: 'standard' },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isGoogle) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
