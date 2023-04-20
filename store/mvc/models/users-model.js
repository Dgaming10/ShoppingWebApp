const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  orders: {
    type: Array,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("users", UserSchema);
