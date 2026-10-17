const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const coludinary = require("cloudinary");
const sendError = require("../utils/sendError");

//Add Category
const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryImage } = req.body;

    const isCategoryExist = await categoryModel.findOne({
      categoryName: new RegExp(`^${String(categoryName || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (isCategoryExist) {
      sendError(res, 400, "Category Already Exist..!!");
    } else {
      const result = await coludinary.v2.uploader.upload(categoryImage, {
        folder: "category",
      });
      const newCategory = await categoryModel.create({
        categoryName,
        categoryImage: result.secure_url || result.url,
      });
      res.status(201).json({
        success: true,
        message: "Category Added..!!",
        newCategory,
      });
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//get all categories
const getAllCategories = async (req, res) => {
  try {
    const CategoriesCount = await categoryModel.find().countDocuments();
    const Categories = await categoryModel.find();
    res.status(200).json({
      success: true,
      Categories,
      CategoriesCount,
      message: "Categories retrieved successfully.",
    });
  } catch (error) {
    sendError(res, 400, "Something Went To Wrong..!!");
  }
};

//delete category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (categoryId) {
      const isCategoryExist = await categoryModel.findById(categoryId);
      if (isCategoryExist) {
        const linkedProducts = await productModel.countDocuments({ category: isCategoryExist._id });
        if (linkedProducts) return sendError(res, 409, "Move or delete products in this category first.");
        const DeletedCategory = await categoryModel.findByIdAndDelete(
          categoryId
        );
        res.status(200).json({
          success: true,
          message: "Category Delete SuccessFully..!!",
          DeletedCategory,
        });
      } else {
        sendError(res, 400, "Category Not Found");
      }
    } else {
      sendError(res, 400, "Category Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, "Something Went's Wrong..!!");
  }
};

//Update Category
const updateCategory = async (req, res) => {
  try {
    if (req.params.categoryId) {
      const category = await categoryModel.findById(req.params.categoryId);
      if (!category) return sendError(res, 404, "Category Not Found");
      if (req.body.categoryImage) {
        const { categoryImage } = req.body;

        const result = await coludinary.v2.uploader.upload(categoryImage, {
          folder: "category",
        });
        category.categoryImage = result.secure_url || result.url;
        if (req.body.categoryName) category.categoryName = req.body.categoryName;
        await category.save();
        res.status(200).json({
          success: true,
          message: "Category Updated..!!",
        });
      } else {
        if (req.body.categoryName) category.categoryName = req.body.categoryName;
        await category.save();
        res.status(200).json({
          success: true,
          message: "Category Updated..!!",
        });
      }
    } else {
      sendError(res, 400, "Category Id Required..!!");
    }
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's To Wrong..!!");
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
};