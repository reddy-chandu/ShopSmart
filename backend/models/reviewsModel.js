const mongoose = require("mongoose");

const reviewsSchema = new mongoose.Schema({
  user: {
    required: true,
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  ratings: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

reviewsSchema.index({ user: 1 }, { unique: true });
reviewsSchema.index({ createdAt: -1 });

const reviewsModel = mongoose.model("reviews", reviewsSchema);

module.exports = reviewsModel;