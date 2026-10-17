import api from '../../api/axios';
import {
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  CLEAR_ERROR,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  LOAD_LOGIN_USER_REQUEST,
  LOAD_LOGIN_USER_FAIL,
  LOAD_LOGIN_USER_SUCCESS,
  LOGOUT_USER_REQUEST,
  LOGOUT_USER_SUCCESS,
  USER_PASSWORD_UPDATE_REQUEST,
  USER_PASSWORD_UPDATE_SUCCESS,
  USER_PASSWORD_UPDATE_FAIL,
  SEND_PASSWORD_REST_EMAIL_REQUEST,
  SEND_PASSWORD_REST_EMAIL_SUCCESS,
  SEND_PASSWORD_REST_EMAIL_FAIL,
  USER_PASSWORD_REST_REQUEST,
  USER_PASSWORD_REST_SUCCESS,
  USER_PASSWORD_REST_FAIL,
  GET_ALL_USERS_REQUEST,
  GET_ALL_USERS_SUCCESS,
  GET_ALL_USERS_FAIL,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  UPDATE_USER_ROLE_REQUEST,
  UPDATE_USER_ROLE_SUCCESS,
  UPDATE_USER_ROLE_FAIL,
  USER_PROFILE_UPDATE_SUCCESS,
} from "../constants/userConstants";
import { CLEAR_CART_ITEM } from "../constants/cartConstants";

// Update an user account details
export const updateMyAccountAction = (profileData) => async (dispatch) => {
  const { data } = await api.put("/api/user/account", profileData);
  dispatch({ type: USER_PROFILE_UPDATE_SUCCESS, payload: data });
  return data;
};

// Delete an user account
export const deleteMyAccountAction = () => async (dispatch) => {
  const { data } = await api.delete("/api/user/account");
  localStorage.removeItem("authToken");
  dispatch({ type: LOGOUT_USER_SUCCESS, payload: data });
  dispatch({ type: CLEAR_CART_ITEM });
  localStorage.setItem("userCart", JSON.stringify([]));
  return data;
};

// Create a new account
export const userRegisterAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const { data } = await api.post("api/user/register", userData);
    dispatch({ type: USER_REGISTER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_REGISTER_FAIL, error: error.response.data.message });
  }
};

// Login to an user account
export const userLoginAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const { data } = await api.post("/api/user/login", userData);
    localStorage.setItem("authToken", data.token);
    dispatch({ type: USER_LOGIN_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
      error: error.response?.data?.message || "Could not sign in.",
    });
  }
};

// Retrieve the logged in user
export const loadUserAction = () => async (dispatch) => {
  try {
    dispatch({ type: LOAD_LOGIN_USER_REQUEST });
    const { data } = await api.get("/api/user/getloggeduser");
    dispatch({
      type: LOAD_LOGIN_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
    }
    dispatch({
      type: LOAD_LOGIN_USER_FAIL,
      error: error.response?.data?.message || "Could not load the signed-in user.",
    });
  }
};

// Logout the user account
export const logOutUserAction = () => async (dispatch) => {
  dispatch({ type: LOGOUT_USER_REQUEST });
  localStorage.removeItem("authToken");
  dispatch({
    type: LOGOUT_USER_SUCCESS,
    payload: { success: true, message: "Logged out successfully." },
  });
};

// Update the user password
export const userPasswordUpdateAction = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_PASSWORD_UPDATE_REQUEST });
    const { data } = await api.put("/api/user/changePassword", userData);
    dispatch({ type: USER_PASSWORD_UPDATE_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message = error.response?.data?.message || "Could not update password.";
    dispatch({
      type: USER_PASSWORD_UPDATE_FAIL,
      error: message,
    });
    return null;
  }
};

// Send reset password email to user
export const restPasswordSendEmailAction = (email) => async (dispatch) => {
  try {
    dispatch({ type: SEND_PASSWORD_REST_EMAIL_REQUEST });
    const { data } = await api.post("/api/user/send-reset-password-email", {
      email,
    });
    dispatch({ type: SEND_PASSWORD_REST_EMAIL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SEND_PASSWORD_REST_EMAIL_FAIL,
      error: error.response.data.message,
    });
  }
};

// Reset password of a user
export const restPasswordAction =
  (id, token, password, confirm_password) => async (dispatch) => {
    try {
      dispatch({ type: USER_PASSWORD_REST_REQUEST });
      const { data } = await api.post(
        `/api/user/reset-password/${id}/${token}`,
        {
          password,
          confirm_password,
        }
      );
      dispatch({ type: USER_PASSWORD_REST_SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: USER_PASSWORD_REST_FAIL,
        error: error.response.data.message,
      });
    }
  };

// Get all users for admin dashboard
export const getAllUsersAdminAction = () => async (dispatch) => {
  try {
    dispatch({ type: GET_ALL_USERS_REQUEST });
    const { data } = await api.get("/api/user/admin/user");
    dispatch({ type: GET_ALL_USERS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_ALL_USERS_FAIL,
      error: error.response.data.message,
    });
  }
};

// Delete a user in admin dashboard
export const deleteUserAdminAction = (userId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_USER_REQUEST });
    const { data } = await api.delete(`/api/user/admin/user/${userId}`);
    dispatch({ type: DELETE_USER_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: DELETE_USER_FAIL, error: error.response.data.message });
  }
};

// Update the user details in admin dashboard
export const adminUpdateUserAction = (userId, UserRole) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_ROLE_REQUEST });
    const { data } = await api.put(`/api/user/admin/user/${userId}`, {
      UserRole,
    });
    dispatch({ type: UPDATE_USER_ROLE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_ROLE_FAIL,
      error: error.response.data.message,
    });
  }
};

// Clear the errors of user actions
export const clearError = () => async (dispatch) => {
  dispatch({ type: CLEAR_ERROR });
};