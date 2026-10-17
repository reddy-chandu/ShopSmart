const express = require("express");
const {
  addCategory,
  getAllCategories,
  deleteCategory,
  updateCategory,
} = require("../Controllers/categoryController");
const isAuthorized = require("../middleware/isAuthorized");
const isAuthUser = require("../middleware/isAuthUser");
const route = express.Router();

route.get("/get", getAllCategories);
route.post("/add", isAuthUser, isAuthorized, addCategory);

route.delete("/delete/:categoryId", isAuthUser, isAuthorized, deleteCategory);
route.put("/update/:categoryId", isAuthUser, isAuthorized, updateCategory);

module.exports = route;