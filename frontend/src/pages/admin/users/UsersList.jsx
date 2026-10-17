import { useEffect } from "react";
import { Link } from "react-router-dom";

import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

import { useDispatch, useSelector } from "react-redux";
import {
  deleteUserAdminAction,
  getAllUsersAdminAction,
} from "../../../redux/actions/userAction";

import Loader from "../../../components/Loader/Loader";
import NotFoundCard from "../../../components/NotFoundCard/NotFoundCard";

const UsersList = () => {
  const dispatch = useDispatch();
  const { users, loading, error, success } = useSelector(
    (state) => state.adminAllUsers
  );

  const {
    loading: deleteLoading,
    error: deleteError,
    success: deleteSuccess,
  } = useSelector((state) => state.adminDeleteUser);

  const deleteUser = async (userId) => {
    if (userId) {
      dispatch(deleteUserAdminAction(userId));
    }
  };

  useEffect(() => {
    dispatch(getAllUsersAdminAction());
  }, [deleteSuccess, dispatch]);

  return (
    <>
      {loading || deleteLoading ? (
        <Loader LoadingName={"Loading Users"} />
      ) : success ? (
        <div className="dashboard-container">
          <div className="dashboard-sub-heading">
            <h1>All Users</h1>
          </div>
          {(error || deleteError) && <p role="alert">{error || deleteError}</p>}
          <div className="products-table">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user._id}>
                    <td><strong>{user.firstName} {user.lastName}</strong></td>
                    <td>{user.email}</td>
                    <td><span className="admin-status admin-status--role">{user.role}</span></td>
                    <td className="admin-row-actions">
                      <Link className="admin-icon-action" aria-label={`Edit ${user.firstName} ${user.lastName}`} to={`/admin/update/${user._id}`} state={{ userId: user._id, userEmail: user.email, userName: `${user.firstName} ${user.lastName}`, userRole: user.role }}>
                        <HiPencilAlt />
                      </Link>
                      <button className="admin-icon-action admin-icon-action--danger" type="button" aria-label={`Delete ${user.firstName} ${user.lastName}`} onClick={() => deleteUser(user._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        <NotFoundCard variant="error" title="Users unavailable" description={error} />
      ) : (
        <NotFoundCard title="No users found" description="New customer accounts will appear here." />
      )}
    </>
  );
};

export default UsersList;