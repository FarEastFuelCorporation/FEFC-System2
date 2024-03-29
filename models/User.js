// models/user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Reference to the Employee model using employeeId
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
