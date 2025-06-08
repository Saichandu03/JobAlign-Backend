const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String
  },
  dailyCounter: {
    type: Number,
    default: 3
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

module.exports = mongoose.model("User", userSchema);
