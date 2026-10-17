import { useEffect } from "react";
import { Link } from "react-router-dom";

import { FiArrowUpRight, FiDollarSign, FiPackage, FiUsers } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import { getAllProductsAction } from "../../redux/actions/productAction";
import { getAllOrdersAdminAction } from "../../redux/actions/orderActions";
import { getAllUsersAdminAction } from "../../redux/actions/userAction";

import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  ArcElement,
} from "chart.js";

import Loader from "../../components/Loader/Loader";
import NotFoundCard from "../../components/NotFoundCard/NotFoundCard";

import "./AdminDashboard.css";

ChartJS.register(Tooltip, ArcElement);

const AdminHome = () => {
  const dispatch = useDispatch();
  const {
    usersCount,
    loading: userLoading,
    error: userError,
    success: userSuccess,
  } = useSelector((state) => state.adminAllUsers);
  const { user } = useSelector((state) => state.user);

  const {
    loading,
    error,
    success: SuccessProducts,
    products,
    productsCount,
  } = useSelector((state) => state.getAllProducts);
  const {
    loading: orderLoading,
    orders,
    success: orderSuccess,
    error: orderError,
  } = useSelector((state) => state.adminAllOrders);

  useEffect(() => {
    document.title = `Admin Dashboard`;
    dispatch(getAllProductsAction());
    dispatch(getAllOrdersAdminAction());
    dispatch(getAllUsersAdminAction());
  }, []);

  const productList = products || [];
  const orderList = orders || [];
  const outOfStock = productList.filter((product) => product.stocks <= 0).length;
  const inStock = productList.length - outOfStock;
  const deliveredRevenue = orderList.reduce(
    (total, order) => total + (order.status === "Delivered" ? Number(order.total) || 0 : 0),
    0
  );
  const orderStages = ["Processing", "Shipped", "Delivered"];
  const stageCounts = Object.fromEntries(
    orderStages.map((stage) => [stage, orderList.filter((order) => order.status === stage).length])
  );

  const doughnutState = {
    labels: ["In stock", "Out of stock"],
    datasets: [
      {
        backgroundColor: ["#16835f", "#e8a45a"],
        hoverBackgroundColor: ["#0c6749", "#d48c41"],
        borderWidth: 0,
        data: [inStock, outOfStock],
      },
    ],
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "76%",
    plugins: { legend: { display: false } },
  };

  return (
    <>
      <div className="dashboard-container admin-dashboard">
        {loading || userLoading || orderLoading ? (
          <Loader LoadingName={"Loading Dashboard"} />
        ) : SuccessProducts && userSuccess && orderSuccess ? (
          <>
            <header className="admin-dashboard__heading">
              <div>
                <span className="admin-dashboard__eyebrow">Store overview</span>
                <h1>Welcome back, {user?.firstName || "Admin"}</h1>
                <p>Here’s what’s happening across your store today.</p>
              </div>
              <Link to="/admin/view/orders" className="admin-dashboard__quick-link">
                View orders <FiArrowUpRight />
              </Link>
            </header>

            <section className="admin-dashboard__metrics" aria-label="Store metrics">
              <Link to="/admin/view/products" className="admin-metric admin-metric--products">
                <span className="admin-metric__icon"><FiPackage /></span>
                <span className="admin-metric__label">Products</span>
                <strong>{productsCount || 0}</strong>
                <span className="admin-metric__hint">Catalog items</span>
              </Link>
              <Link to="/admin/view/users" className="admin-metric admin-metric--users">
                <span className="admin-metric__icon"><FiUsers /></span>
                <span className="admin-metric__label">Customers</span>
                <strong>{usersCount || 0}</strong>
                <span className="admin-metric__hint">Registered accounts</span>
              </Link>
              <div className="admin-metric admin-metric--revenue">
                <span className="admin-metric__icon"><FiDollarSign /></span>
                <span className="admin-metric__label">Delivered sales</span>
                <strong>₹{deliveredRevenue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                <span className="admin-metric__hint">Completed orders</span>
              </div>
              <div className="admin-metric admin-metric--orders">
                <span className="admin-metric__icon"><FiArrowUpRight /></span>
                <span className="admin-metric__label">Orders</span>
                <strong>{orderList.length}</strong>
                <span className="admin-metric__hint">All order statuses</span>
              </div>
            </section>

            <section className="admin-dashboard__panels">
              <article className="admin-panel admin-pipeline">
                <div className="admin-panel__heading">
                  <div><h2>Order pipeline</h2><p>Current fulfillment status</p></div>
                  <Link to="/admin/view/orders">All orders</Link>
                </div>
                {orderStages.map((stage) => {
                  const count = stageCounts[stage];
                  const ratio = orderList.length ? (count / orderList.length) * 100 : 0;
                  return (
                    <div className="admin-pipeline__row" key={stage}>
                      <div className="admin-pipeline__label"><span>{stage}</span><strong>{count}</strong></div>
                      <div className="admin-pipeline__track"><span style={{ width: `${ratio}%` }} /></div>
                    </div>
                  );
                })}
              </article>

              <article className="admin-panel admin-inventory">
                <div className="admin-panel__heading">
                  <div><h2>Inventory health</h2><p>Availability across catalog</p></div>
                  <Link to="/admin/view/products">Manage</Link>
                </div>
                <div className="admin-inventory__chart">
                  <Doughnut data={doughnutState} options={doughnutOptions} />
                </div>
                <div className="admin-inventory__legend">
                  <span><i className="is-stocked" />In stock <strong>{inStock}</strong></span>
                  <span><i className="is-empty" />Out of stock <strong>{outOfStock}</strong></span>
                </div>
              </article>
            </section>
          </>
        ) : error || userError || orderError ? (
          <NotFoundCard variant="error" title="Dashboard unavailable" description={error || userError || orderError} />
        ) : (
          <NotFoundCard title="No store activity yet" description="Your dashboard will fill in as products, customers, and orders are added." />
        )}
      </div>
    </>
  );
};

export default AdminHome;