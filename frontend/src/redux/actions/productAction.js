import api from "../../api/axios";
import {
  ADD_PRODUCT_FAIL,
  ADD_PRODUCT_REQUEST,
  ADD_PRODUCT_SUCCESS,
  CLEAR_ERRORS,
  DELETE_PRODUCT_FAIL,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  GET_ALL_PRODUCTS_FAIL,
  GET_ALL_PRODUCTS_REQUEST,
  GET_ALL_PRODUCTS_SUCCESS,
  GET_SINGLE_PRODUCT_FAIL,
  GET_SINGLE_PRODUCT_REQUEST,
  GET_SINGLE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAIL,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
} from "../constants/productConstants";

// Add new products
export const AddProductsAction = (formData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_PRODUCT_REQUEST });
    const { data } = await api.post("/api/product/add", formData);
    dispatch({ type: ADD_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: ADD_PRODUCT_FAIL, error: error.response.data.message });
  }
};

// Get all products
export const getAllProductsAction =
  (price = "0-1000", filterCategory, keyword = "", priceMode = "range") =>
  async (dispatch) => {
    try {
      dispatch({ type: GET_ALL_PRODUCTS_REQUEST });
      const params = new URLSearchParams();
      const normalizedKeyword = typeof keyword === "string" ? keyword.trim() : "";

      if (normalizedKeyword) params.set("keyword", normalizedKeyword);
      if (filterCategory !== undefined && filterCategory !== null) {
        params.set(
          "category",
          Array.isArray(filterCategory) ? filterCategory.join(",") : filterCategory
        );
      }

      if (filterCategory !== undefined && price) {
        if (priceMode === "lt") {
          params.set("lt", price);
        } else if (priceMode === "gt") {
          params.set("gt", price);
        } else {
          const [gte, lte] = price.split("-");
          if (gte !== "") params.set("gte", gte);
          if (lte !== "") params.set("lte", lte);
        }
      }

      const query = params.toString();
      const UrlLink = query
        ? `/api/product/getAllProducts?${query}`
        : "/api/product/getAllProducts";
      const { data } = await api.get(UrlLink);
      dispatch({ type: GET_ALL_PRODUCTS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: GET_ALL_PRODUCTS_FAIL,
        error: error.response.data.message,
      });
    }
};

// Delete a single product
export const deleteProductAction = (productId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_PRODUCT_REQUEST });
    const { data } = await api.delete(`/api/product/delete/${productId}`);
    dispatch({ type: DELETE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: DELETE_PRODUCT_FAIL, error: error.response.data.message });
  }
};

// Get a single product
export const getSingleProductAction = (productId) => async (dispatch) => {
  try {
    dispatch({ type: GET_SINGLE_PRODUCT_REQUEST });
    const { data } = await api.get(
      `/api/product/getSingleProduct/${productId}`
    );
    dispatch({ type: GET_SINGLE_PRODUCT_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_SINGLE_PRODUCT_FAIL,
      error: error.response.data.message,
    });
  }
};

// Update the product details
export const updateProductAction =
  (productId, updateFormData) => async (dispatch) => {
    try {
      dispatch({ type: UPDATE_PRODUCT_REQUEST });
      const { data } = await api.put(
        `/api/product/update/${productId}`,
        updateFormData
      );
      dispatch({ type: UPDATE_PRODUCT_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: UPDATE_PRODUCT_FAIL,
        error: error.response.data.message,
      });
    }
};

// Clear the errors of product actions
export const clearError = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
};