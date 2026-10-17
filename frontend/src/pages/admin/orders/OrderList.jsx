import { useEffect } from "react";
import { Link } from "react-router-dom";

import { HiPencilAlt } from "react-icons/hi";

import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersAdminAction } from "../../../redux/actions/orderActions";

import Loader from "../../../components/Loader/Loader";
import NotFoundCard from "../../../components/NotFoundCard/NotFoundCard";

const OrderList = () => {
  const dispatch = useDispatch();
  const { loading, orders, success, error } = useSelector(
    (state) => state.adminAllOrders
  );
  useEffect(() => {
    dispatch(getAllOrdersAdminAction());
  }, [dispatch]);
  return (
    <>
      <div className="dashboard-container">
        {loading ? (
          <Loader LoadingName={"Orders Loading"} />
        ) : success ? (
          <>
            <div className="dashboard-sub-heading">
              <h1>All Orders</h1>
            </div>

            <div className="products-table">
              <table>
                <thead>
                  <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order._id}>
                      <td><Link to={`/admin/update/order/${order._id}`}>#{order._id.slice(-8).toUpperCase()}</Link></td>
                      <td>{order?.user ? `${order.user.firstName} ${order.user.lastName}` : "Deleted customer"}</td>
                      <td>{order.orderItems?.length || 0}</td>
                      <td>₹{Number(order.total).toFixed(2)}</td>
                      <td><span className={`admin-status admin-status--${order.status?.toLowerCase()}`}>{order.status}</span></td>
                      <td>{order.orderDate}</td>
                      <td className="admin-row-actions">
                        <Link className="admin-icon-action" aria-label={`View order ${order._id}`} to={`/admin/update/order/${order._id}`}><HiPencilAlt /></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : error ? (
          <NotFoundCard variant="error" title="Orders unavailable" description={error} />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default OrderList;