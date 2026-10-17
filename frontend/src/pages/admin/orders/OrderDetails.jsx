import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  getAdminOrderDetailsAction,
  updateOrdersAdminAction,
} from "../../../redux/actions/orderActions";

import Loader from "../../../components/Loader/Loader";
import NotFoundCard from "../../../components/NotFoundCard/NotFoundCard";

import { formatQuantity, formatRate } from "../../../utils/productUnits";

import "./OrderList.css";

const AdminOrderDetails = () => {
  const [oStatus, setOrderStatus] = useState("");

  const {
    loading: orderLoading,
    order,
    error: orderError,
  } = useSelector((state) => state.getOrderDetails);

  const {
    loading: updateLoading,
    success,
    error: updateOrderError,
  } = useSelector((state) => state.adminUpdateOrder);

  const dispatch = useDispatch();
  const { orderId } = useParams();

  const updateOrderStatus = () => {
    if (oStatus !== "") {
      dispatch(updateOrdersAdminAction(orderId, oStatus));
    } else {
      alert("Select Order Status..!!");
    }
  };

  useEffect(() => {
    if (orderId) {
      dispatch(getAdminOrderDetailsAction(orderId));
    }
  }, [dispatch, orderId, updateLoading]);

  return (
    <>
      <div className="dashboard-container admin-order-details">
        {orderLoading ? (
          <Loader LoadingName={"Order Loading"} />
        ) : orderError ? (
          <>
            <NotFoundCard variant="error" title="Order details unavailable" description={orderError} />
          </>
        ) : order && order.orderItems ? (
          <>
            <div className="orders-container "></div>
            <div className="dashboard-sub-heading">
              <h1>Order Details</h1>
            </div>
            {updateOrderError && <p role="alert">{updateOrderError}</p>}
            {success && <p className="admin-inline-success" role="status">Order status updated.</p>}
            <div className="orders-box">
              <div className="orders-cart-item">
                <div className="orders-cart-item-box">
                  <div className="orders-total-cart-price">
                    <h2>Order Items : {order && order.orderItems.length} </h2>
                    <h2 className="">
                      Total Amount : ₹ {order && order.total}{" "}
                    </h2>
                    {order.status === "Delivered" ? (
                      ""
                    ) : (
                      <>
                        <select
                          className="update-order-status"
                          value={oStatus}
                          onChange={(e) => {
                            setOrderStatus(e.target.value);
                          }}
                        >
                          <option value="">Update State</option>
                          {order.status === "Processing" ? (
                            <option value="Shipped">Shipped</option>
                          ) : (
                            <option value="Delivered">Delivered</option>
                          )}
                        </select>
                        <button
                          className="update-order-status-btn"
                          onClick={updateOrderStatus}
                          disabled={updateLoading || !oStatus}
                        >
                          {updateLoading ? "Saving..." : "Update status"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {order &&
                  order.orderItems.map((item, index) => {
                    return (
                      <div className="orders-cart-item-box" key={`${item.product || "item"}-${index}`}>
                        <img src={item.image} alt={item.name} />
                        <div>
                          <h2>{item.name}</h2>
                          <h4> Quantity : {formatQuantity(item.quantity, item.quantityUnit)} </h4>
                          <h4> Rate : {formatRate(item.rate, item.quantityUnit)} </h4>
                        </div>
                        <div className="">
                          <h3>₹ {item.rate * item.quantity}</h3>
                          <h3
                            className={
                              order.status === "Processing"
                                ? "order-processing-status"
                                : order.status === "Shipped"
                                ? "order-shipping-status"
                                : "order-delivered-status"
                            }
                          >
                            {order.status}
                          </h3>
                          <span className="order-date"> {order.orderDate}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        ) : (
          <NotFoundCard title="Order not found" description="This order may have been removed or the link may be incorrect." />
        )}
      </div>
    </>
  );
};

export default AdminOrderDetails;