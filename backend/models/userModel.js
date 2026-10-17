const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please Enter Your Name"],
    trim: true,
    minLength: [2, "Name : Minimum Two Character"],
  },

  lastName: {
    type: String,
    required: [true, "Please Enter Your Last Name"],
    trim: true,
  },

  role: {
    type: String,
    enum: ["User", "Admin"],
    default: "User",
  },

  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    lowercase: true,
    trim: true,
  },

  deliveryAddress: {
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, trim: true, default: "" },
    pinCode: { type: String, trim: true, default: "" },
  },

  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    select: false,
    trim: true,
    minLength: [4, "Password : Minimum Four Character"],
  },
}, { timestamps: true });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;