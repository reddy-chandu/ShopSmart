import api from '../../api/axios';
import {
  GET_ALL_ORDERS_ADMIN_FAIL,
  GET_ALL_ORDERS_ADMIN_REQUEST,
  GET_ALL_ORDERS_ADMIN_SUCCESS,
  GET_USER_ORDERS_DETAILS_FAIL,
  GET_USER_ORDERS_DETAILS_REQUEST,
  GET_USER_ORDERS_DETAILS_SUCCESS,
  GET_USER_ORDERS_FAIL,
  GET_USER_ORDERS_REQUEST,
  GET_USER_ORDERS_SUCCESS,
  UPDATE_ORDER_ADMIN_FAIL,
  UPDATE_ORDER_ADMIN_REQUEST,
  UPDATE_ORDER_ADMIN_SUCCESS,
} from "../constants/orderConstants";

// Get orders of an user
export const getUsersOrdersAction = (userId) => async (dispatch) => {
  try {
    dispatch({ type: GET_USER_ORDERS_REQUEST });
    const { data } = await api.get("/api/user/my/orders");
    dispatch({ type: GET_USER_ORDERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ORDERS_FAIL,
      error: error.response.data.message,
    });
  }
};

// Get details of an user order
export const getUsersOrderDetailsAction = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: GET_USER_ORDERS_DETAILS_REQUEST });
    const { data } = await api.get(`/api/user/my/order/${orderId}`);
    dispatch({ type: GET_USER_ORDERS_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ORDERS_DETAILS_FAIL,
      error: error.response.data.message,
    });
  }
};

// Get an user order details for admin
export const getAdminOrderDetailsAction = (orderId) => async (dispatch) => {
  try {
    dispatch({ type: GET_USER_ORDERS_DETAILS_REQUEST });
    const { data } = await api.get(`/api/user/admin/order/${orderId}`);
    dispatch({ type: GET_USER_ORDERS_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_USER_ORDERS_DETAILS_FAIL,
      error: error.response?.data?.message || "Could not load this order.",
    });
  }
};

// Get all orders for admin dashboard
export const getAllOrdersAdminAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_ORDERS_ADMIN_REQUEST });
    const { data } = await api.get("/api/user/admin/orders");
    dispatch({ type: GET_ALL_ORDERS_ADMIN_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_ORDERS_ADMIN_FAIL,
      error: error.response?.data?.message || "Could not load orders.",
    });
  }
};

// Update an order status
export const updateOrdersAdminAction =
  (orderId, oStatus) => async (dispatch) => {
    try {
      dispatch({ type: UPDATE_ORDER_ADMIN_REQUEST });
      const { data } = await api.put(`/api/user/update/order/${orderId}`, {
        oStatus,
      });
      dispatch({ type: UPDATE_ORDER_ADMIN_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: UPDATE_ORDER_ADMIN_FAIL,
        error: error.response?.data?.message || "Could not update order status.",
      });
    }
};