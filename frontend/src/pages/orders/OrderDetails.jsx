import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { FiArrowLeft, FiCheck, FiMapPin, FiPackage, FiPhone } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { getUsersOrderDetailsAction } from "../../redux/actions/orderActions";

import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import Loader from "../../components/Loader/Loader";
import NotFoundCard from "../../components/NotFoundCard/NotFoundCard";

import { formatQuantity, formatRate } from "../../utils/productUnits";

import "./Orders.css";

const orderStages = ["Processing", "Shipped", "Delivered"];

const OrderDetails = () => {
  const {
    loading: orderLoading,
    order,
    error: orderError,
  } = useSelector((state) => state.getOrderDetails);
  const dispatch = useDispatch();
  const { orderId } = useParams();

  useEffect(() => {
    if (orderId) {
      document.title = "Order Details";
      dispatch(getUsersOrderDetailsAction(orderId));
    }
  }, [dispatch, orderId]);

  const currentStage = Math.max(orderStages.indexOf(order?.status), 0);
  const shippingInfo = order?.shippingInfo || {};
  const items = order?.orderItems || [];

  return (
    <>
      <Header />
      {orderLoading ? (
        <Loader LoadingName={"Order Loading"} />
      ) : orderError ? (
        <main className="order-detail-page order-detail-message">
          <NotFoundCard variant="error" title="Order details unavailable" description={orderError} />
        </main>
      ) : order && order.orderItems ? (
        <main className="order-detail-page">
          <Link className="back-to-orders" to="/orders"><FiArrowLeft /> All orders</Link>

          <div className="order-detail-heading">
            <div>
              <span className="orders-eyebrow">Order #{order._id.slice(-8).toUpperCase()}</span>
              <h1>Order details</h1>
              <p>Placed on {order.orderDate}</p>
            </div>
            <span className={`order-status-pill order-status-pill--${order.status?.toLowerCase()}`}>
              {order.status}
            </span>
          </div>

          <section className="order-progress" aria-label={`Order status: ${order.status}`}>
            {orderStages.map((stage, index) => (
              <div className={`order-progress-step${index <= currentStage ? " is-complete" : ""}${index === currentStage ? " is-current" : ""}`} key={stage}>
                <span className="order-progress-marker">{index < currentStage ? <FiCheck /> : index + 1}</span>
                <span>{stage}</span>
              </div>
            ))}
          </section>

          <div className="order-detail-grid">
            <section className="order-items-panel">
              <div className="order-panel-heading">
                <div><h2>Items in this order</h2><span>{items.length} {items.length === 1 ? "product" : "products"}</span></div>
                <FiPackage aria-hidden="true" />
              </div>
              <div className="order-detail-items">
                {items.map((item, index) => (
                  <article className="order-detail-item" key={`${order._id}-${item.product || "item"}-${index}`}>
                    <div className="order-detail-image"><img src={item.image} alt={item.name} /></div>
                    <div className="order-detail-item-info">
                      <h3>{item.name}</h3>
                      <p>{formatQuantity(item.quantity, item.quantityUnit)}</p>
                      <span>{formatRate(item.rate, item.quantityUnit)}</span>
                    </div>
                    <strong>₹{(Number(item.rate) * Number(item.quantity)).toFixed(2)}</strong>
                  </article>
                ))}
              </div>
            </section>

            <aside className="order-detail-sidebar">
              <section className="order-side-section order-total-section">
                <h2>Payment summary</h2>
                <div><span>Items total</span><span>₹{Number(order.total).toFixed(2)}</span></div>
                <div><span>Delivery</span><span className="free-delivery">Free</span></div>
                <div className="order-grand-total"><strong>Total paid</strong><strong>₹{Number(order.total).toFixed(2)}</strong></div>
              </section>

              <section className="order-side-section order-address-section">
                <h2><FiMapPin /> Delivery address</h2>
                <p>{shippingInfo.address}</p>
                <p>{shippingInfo.city}{shippingInfo.city && shippingInfo.pinCode ? ", " : ""}{shippingInfo.pinCode}</p>
                {shippingInfo.mobileNumber && <p className="order-phone"><FiPhone /> {shippingInfo.mobileNumber}</p>}
              </section>
            </aside>
          </div>
        </main>
      ) : (
        <main className="order-detail-page order-detail-message">
          <NotFoundCard title="Order not found" description="This order may have been removed or the link may be incorrect." />
        </main>
      )}
      <Footer />
    </>
  );
};

export default OrderDetails;