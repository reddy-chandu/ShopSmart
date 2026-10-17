import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  adminUpdateUserAction,
  clearError,
  getAllUsersAdminAction,
} from "../../../redux/actions/userAction";

const UpdateUser = () => {
  const dispatch = useDispatch();
  const Location = useLocation();
  const { userId: routeUserId } = useParams();
  const routeUser = Location.state || {};
  const { users = [] } = useSelector((state) => state.adminAllUsers);
  const loadedUser = users.find((item) => item._id === routeUserId);
  const { success, loading, message, error } = useSelector(
    (state) => state.adminUpdateUser
  );

  const [userRole, setUserRole] = useState(routeUser.userRole || "");
  const userName = routeUser.userName || (loadedUser ? `${loadedUser.firstName} ${loadedUser.lastName}` : "");
  const userEmail = routeUser.userEmail || loadedUser?.email || "";
  const existingRole = routeUser.userRole || loadedUser?.role || "";
  const userId = routeUserId || routeUser.userId;

  useEffect(() => {
    if (!routeUser.userName && !loadedUser) dispatch(getAllUsersAdminAction());
  }, [dispatch, loadedUser, routeUser.userName]);

  useEffect(() => {
    if (!userRole && existingRole) setUserRole(existingRole);
  }, [existingRole, userRole]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timer);
  }, [dispatch, error]);

  const handelUpdateUserSubmit = (e) => {
    e.preventDefault();
    if (userRole === "") {
      alert("Choose Role");
    } else {
      dispatch(adminUpdateUserAction(userId, userRole));
    }
  };

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-sub-heading">
          <h1>Update User</h1>
        </div>

        <div className="add-product-form-box">
          <form onSubmit={(e) => handelUpdateUserSubmit(e)}>
            <div className="product-name">
              <input
                type="text"
                value={userName}
                placeholder="User Name"
                readOnly
              />
            </div>

            <div className="product-name">
              <input
                type="text"
                value={userEmail}
                placeholder="User email"
                readOnly
              />
            </div>

            <div className="product-name">
              <input
                type="text"
                value={existingRole}
                placeholder="User role"
                readOnly
              />
            </div>
            <div className="product-category">
              <select
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value);
                }}
                required
              >
                <option value="">Choose Role</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            {error ? (
              <div className="upload-error">
                <h1>{error}</h1>
              </div>
            ) : (
              ""
            )}

            {success ? (
              <div className="upload-error">
                <h1>{message}</h1>
              </div>
            ) : (
              ""
            )}

            <div className="add-product-form-btn">
              <button disabled={loading || !userId}>{loading ? "Saving..." : "Update Role"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateUser;