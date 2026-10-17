const reviewsModel = require("../models/reviewsModel");
const sendError = require("../utils/sendError");

const getMyReview = async (req, res) => {
  try {
    const review = await reviewsModel
      .findOne({ user: req.user._id })
      .select("_id comment ratings createdAt updatedAt")
      .lean();
    res.status(200).json({ success: true, review });
  } catch (error) {
    sendError(res, 500, "Could not load your review.");
  }
};

const addReviews = async (req, res) => {
  try {
    const { comment, ratings } = req.body;
    const review = await reviewsModel.findOneAndUpdate(
      { user: req.user._id },
      { $set: { comment, ratings }, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, message: "Review Saved..!!", review });
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//get All Reviews fro client
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewsModel
      .find()
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName");
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//get all reviews fro admin
const AdminGetAllReviews = async (req, res) => {
  try {
    const reviews = await reviewsModel
      .find()
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName");
    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    sendError(res, 400, "Somethings Went To Wrong..!!");
  }
};

//Delete Product
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (reviewId) {
      const review = await reviewsModel.findById(reviewId);
      if (review) {
        const deletedReview = await reviewsModel.findByIdAndDelete(reviewId);
        res.status(200).json({
          success: true,
          message: "Review Delete SuccessFully..!!",
        });
      } else {
        sendError(res, 400, "Review Not Found");
      }
    } else {
      sendError(res, 400, "Review Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

module.exports = {
  getMyReview,
  addReviews,
  getAllReviews,
  deleteReview,
  AdminGetAllReviews,
};