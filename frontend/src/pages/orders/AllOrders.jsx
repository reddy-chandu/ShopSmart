import { useEffect } from "react";
import { Link } from "react-router-dom";

import { FiArrowRight, FiBox, FiPackage } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { getUsersOrdersAction } from "../../redux/actions/orderActions";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";

import { formatQuantity, formatRate } from "../../utils/productUnits";

import "./Orders.css";

const AllOrders = () => {
  const dispatch = useDispatch();

  const { user, loading: userLoading } = useSelector((state) => state.user);
  const { orders, loading: ordersLoading, error } = useSelector(
    (state) => state.getAllOrders
  );
  const orderList = orders || [];
  const deliveredCount = orderList.filter((order) => order.status === "Delivered").length;
  const shippedCount = orderList.filter((order) => order.status === "Shipped").length;

  useEffect(() => {
    if (user && user._id) {
      document.title = `${user.firstName} Orders`;
      dispatch(getUsersOrdersAction(user._id));
    }
  }, [dispatch, user]);

  return (
    <>
      <Header />
      {ordersLoading || userLoading ? (
        <Loader LoadingName={"Loading Orders"} />
      ) : (
        <main className="orders-page orders-list-page">
          <div className="orders-intro">
            <div>
              <span className="orders-eyebrow">Your ShopSmart account</span>
              <h1>My orders</h1>
              <p>Follow your deliveries and revisit everything you have ordered.</p>
            </div>
            {user?.firstName && <span className="orders-user-greeting">Welcome back, {user.firstName}</span>}
          </div>

          {!error && orderList.length > 0 && (
            <div className="orders-overview" aria-label="Order summary">
              <div><span>Total orders</span><strong>{orderList.length}</strong></div>
              <div><span>On the way</span><strong>{shippedCount}</strong></div>
              <div><span>Delivered</span><strong>{deliveredCount}</strong></div>
            </div>
          )}

          <section className="orders-list-section">
            <div className="orders-section-heading">
              <div>
                <h2>Order history</h2>
                <p>{orderList.length} {orderList.length === 1 ? "order" : "orders"}</p>
              </div>
            </div>

            {error ? (
              <div className="orders-empty-state">
                <FiBox aria-hidden="true" />
                <h2>Orders aren’t available right now</h2>
                <p>{error}</p>
              </div>
            ) : orderList.length === 0 ? (
              <div className="orders-empty-state">
                <FiPackage aria-hidden="true" />
                <h2>Your order history starts here</h2>
                <p>Once you place an order, you can track it from this page.</p>
                <Link to="/products" className="orders-primary-link">Explore products <FiArrowRight /></Link>
              </div>
            ) : (
              <div className="orders-list">
                {orderList.map((order) => (
                  <article className="order-summary" key={order._id}>
                    <header className="order-summary-header">
                      <div className="order-summary-meta">
                        <div><span>Order placed</span><strong>{order.orderDate}</strong></div>
                        <div><span>Order number</span><strong>#{order._id.slice(-8).toUpperCase()}</strong></div>
                      </div>
                      <span className={`order-status-pill order-status-pill--${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <div className="order-summary-total"><span>Order total</span><strong>₹{Number(order.total).toFixed(2)}</strong></div>
                    </header>

                    <div className="order-summary-items">
                      {(order.orderItems || []).map((item, index) => (
                        <div className="order-summary-item" key={`${order._id}-${item.product || "item"}-${index}`}>
                          <img src={item.image} alt={item.name} />
                          <div className="order-item-description">
                            <h3>{item.name}</h3>
                            <span>{formatQuantity(item.quantity, item.quantityUnit)} · {formatRate(item.rate, item.quantityUnit)}</span>
                          </div>
                          <strong className="order-item-total">₹{(Number(item.rate) * Number(item.quantity)).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>

                    <footer className="order-summary-footer">
                      <span>{(order.orderItems || []).length} {(order.orderItems || []).length === 1 ? "product" : "products"}</span>
                       <Link to={`/orders/${order._id}`}>View order <FiArrowRight /></Link>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}
      <Footer />
    </>
  );
};

export default AllOrders;