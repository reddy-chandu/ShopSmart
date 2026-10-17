import {
  GET_ALL_REVIEWS_FAIL,
  GET_ALL_REVIEWS_REQUEST,
  GET_ALL_REVIEWS_SUCCESS,
  CLEAR_ERRORS,
  GET_ALL_ADMIN_REVIEWS_REQUEST,
  GET_ALL_ADMIN_REVIEWS_SUCCESS,
  GET_ALL_ADMIN_REVIEWS_FAIL,
  DELETE_REVIEWS_REQUEST,
  DELETE_REVIEWS_REVIEWS_SUCCESS,
  DELETE_REVIEWS_REVIEWS_FAIL,
} from "../constants/reviewsConstants";

// Get all reviews reducer
export const getAllReviewsReducer = (state = { reviews: [] }, action) => {
  switch (action.type) {
    case GET_ALL_REVIEWS_REQUEST:
      return { loading: true };
    case GET_ALL_REVIEWS_SUCCESS:
      return {
        loading: false,
        reviews: action.payload.reviews,
        success: action.payload.success,
      };
    case GET_ALL_REVIEWS_FAIL:
      return {
        loading: false,
        error: action.error,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Get all reviews reducer for admin
export const getAllAdminReviewsReducer = (state = { reviews: [] }, action) => {
  switch (action.type) {
    case GET_ALL_ADMIN_REVIEWS_REQUEST:
      return { loading: true };
    case GET_ALL_ADMIN_REVIEWS_SUCCESS:
      return {
        loading: false,
        reviews: action.payload.reviews,
        success: action.payload.success,
      };
    case GET_ALL_ADMIN_REVIEWS_FAIL:
      return {
        loading: false,
        error: action.error,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Delete reviews reducer for admin
export const deleteReviewsReducer = (state = {}, action) => {
  switch (action.type) {
    case DELETE_REVIEWS_REQUEST:
      return { loading: true };
    case DELETE_REVIEWS_REVIEWS_SUCCESS:
      return {
        loading: false,
        success: action.payload.success,
        message: action.payload.message,
      };
    case DELETE_REVIEWS_REVIEWS_FAIL:
      return {
        loading: false,
        error: action.error,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};