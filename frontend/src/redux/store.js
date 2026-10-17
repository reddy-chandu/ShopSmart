import { configureStore } from "@reduxjs/toolkit";
import {
  loginReducer,
  registerReducer,
  logOutUser,
  userPasswordUpdateReducer,
  passwordResetEmailSendReducer,
  userPasswordResetReducer,
  getAllUserAdminReducer,
  deleteUserAdminReducer,
  updateUserRoleReducer,
} from "./reducers/userReducers";
import {
  getAllProductsReducer,
  addProductsReducer,
  deleteProductReducer,
  getSingleProductReducer,
  updateProductReducer,
} from "./reducers/productReducer";
import { myCartProductReducer } from "./reducers/cartReducer";
import {
  addCategoryReducer,
  deleteCategoryReducer,
  getCategoryReducer,
  updateCategoryReducer,
} from "./reducers/categoryReducer";
import {
  getAllOrdersAdminReducer,
  getUpdateOrderAdminReducer,
  getUserOrderDetailsReducer,
  getUserOrderReducer,
} from "./reducers/ordersReducer";
import {
  deleteReviewsReducer,
  getAllAdminReviewsReducer,
  getAllReviewsReducer,
} from "./reducers/reviewsReducer";


const getSavedCartItems = () => {
  try {
    const items = JSON.parse(localStorage.getItem("userCart") || "[]");

    if (!Array.isArray(items)) return [];

    return items;
  } catch (error) {
    return [];
  }
};

const preloadedState = {
  userCart: {
    cartItems: getSavedCartItems(),
  },
};

const store = configureStore({
  reducer: {
    //User Reducer
    register: registerReducer,
    user: loginReducer,
    logOut: logOutUser,
    passwordUpdate: userPasswordUpdateReducer,
    sendResetPassMail: passwordResetEmailSendReducer,
    passwordReset: userPasswordResetReducer,
    getAllOrders: getUserOrderReducer,
    getOrderDetails: getUserOrderDetailsReducer,
    getAllReviews: getAllReviewsReducer,
    userCart: myCartProductReducer,

    // Product Reducers:
    addProduct: addProductsReducer,
    getAllProducts: getAllProductsReducer,
    getSingleProduct: getSingleProductReducer,
    deleteProduct: deleteProductReducer,
    updateProduct: updateProductReducer,

    //Category Reducer
    addCategory: addCategoryReducer,
    getAllCategory: getCategoryReducer,
    deleteCategory: deleteCategoryReducer,

    //Admin Reducer
    adminAllOrders: getAllOrdersAdminReducer,
    adminUpdateOrder: getUpdateOrderAdminReducer,
    adminAllUsers: getAllUserAdminReducer,
    adminDeleteUser: deleteUserAdminReducer,
    adminUpdateUser: updateUserRoleReducer,
    adminUpdateCategory: updateCategoryReducer,
    adminGetReviews: getAllAdminReviewsReducer,
    deleteReview: deleteReviewsReducer,
  },
  preloadedState,
});

export default store;