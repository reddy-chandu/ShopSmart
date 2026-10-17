import { useEffect } from "react";
import { createBrowserRouter, RouterProvider, ScrollRestoration, Navigate, Outlet, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { loadUserAction } from "./redux/actions/userAction";

import Home from "./pages/home/Home";
import Products from "./pages/products/Products";
import SignIn from "./pages/auth/SignIn";
import CreateAccount from "./pages/auth/CreateAccount";
import ForgotPassword from "./pages/password/ForgotPassword";
import Checkout from "./pages/checkout/Checkout";
import AccountSettings from "./pages/account/AccountSettings";
import ResetPassword from "./pages/password/ResetPassword";
import OrderDetails from "./pages/orders/OrderDetails";
import AllOrders from "./pages/orders/AllOrders";
import AddReviews from "./pages/reviews/AddReviews";
import AllReviews from "./pages/reviews/AllReviews";
import AboutUs from "./pages/about/AboutUs";
import SmartieAI from "./components/SmartieAI/SmartieAI";
import Loader from "./components/Loader/Loader";
import PageNotFound from "./components/PageNotFound/PageNotFound";
import NotFoundCard from "./components/NotFoundCard/NotFoundCard";

import AdminHome from "./pages/admin/AdminHome";
import AddProduct from "./pages/admin/products/AddProduct";
import AddCategory from "./pages/admin/products/AddCategory";
import ViewProducts from "./pages/admin/products/ViewProducts";
import AdminProducts from "./pages/admin/products/AdminProducts";
import UpdateProducts from "./pages/admin/products/UpdateProducts";
import ViewCategory from "./pages/admin/products/ViewCategory";
import UpdateCategory from "./pages/admin/products/UpdateCategory";
import OrderList from "./pages/admin/orders/OrderList";
import AdminOrderDetails from "./pages/admin/orders/OrderDetails";
import UsersList from "./pages/admin/users/UsersList";
import UpdateUser from "./pages/admin/users/UpdateUser";
import ReviewsList from "./pages/admin/reviews/ReviewsList";
import AdminLayout from "./pages/admin/AdminLayout";

import "./App.css";

// 1. Core Layout Shell: This runs UNDER the router provider context safely
const AppLayout = () => {
  const { loading: userLoading = true } = useSelector((state) => state.user);
  const pathname = useLocation().pathname.toLowerCase();

  const excludedPaths = [
    "/sign-in",
    "/create-account",
    "/forgot-password",
    "/account",
  ];

  const shouldHideAI =
    excludedPaths.includes(pathname) ||
    pathname.startsWith("/reset-password/") ||
    pathname.startsWith("/admin");

  return (
    <>
      <ScrollRestoration />
      {userLoading ? (
        <Loader LoadingName="Loading ShopSmart" />
      ) : (
        <>
          {!shouldHideAI && <SmartieAI />}
          {/* This renders matching active child pages */}
          <Outlet />
        </>
      )}
    </>
  );
};

// 2. Auth Guard Wrapper Component
const AuthRoute = ({ element, condition, fallback }) => {
  const userState = useSelector((state) => state.user);
  const allowed = typeof condition === "function" ? condition(userState) : condition;
  return allowed ? element : (fallback || <Navigate to="/" replace />);
};

// 3. Central Router Mapping Definition Array
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // The layout shell containing GlobalSmartieAI logic
    children: [
      { index: true, element: <Home /> },

      // Guest-Only Authentication Pages
      { path: "create-account", element: <AuthRoute element={<CreateAccount />} condition={u => !u.isAuthUser} /> },
      { path: "sign-in", element: <AuthRoute element={<SignIn />} condition={u => !u.isAuthUser} /> },
      { path: "forgot-password", element: <AuthRoute element={<ForgotPassword />} condition={u => !u.isAuthUser} /> },
      { path: "reset-password/:id/:token", element: <AuthRoute element={<ResetPassword />} condition={u => !u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },

      // Open/Public Pages
      { path: "products", element: <Products /> },
      { path: "products/:keyword", element: <Products /> },
      { path: "products/category/:categoryId", element: <Products /> },
      { path: "reviews/all", element: <AllReviews /> },
      { path: "about-us", element: <AboutUs /> },

      // Protected Authenticated Client Pages
      { path: "checkout", element: <Checkout /> },
      { path: "account", element: <AuthRoute element={<AccountSettings />} condition={u => u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },
      { path: "orders", element: <AuthRoute element={<AllOrders />} condition={u => u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },
      { path: "orders/:orderId", element: <AuthRoute element={<OrderDetails />} condition={u => u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },
      { path: "reviews/add", element: <AuthRoute element={<AddReviews />} condition={u => u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },
      { path: "Order/OrderDetails/:orderId", element: <AuthRoute element={<OrderDetails />} condition={u => u.isAuthUser} fallback={<Navigate to="/sign-in" replace />} /> },

      // Nested Admin Panel Routes
      {
        path: "admin",
        element: <AuthRoute element={<AdminLayout />} condition={u => u.user?.role === "Admin"} fallback={u => <Navigate to={u.isAuthUser ? "/" : "/sign-in"} replace />} />,
        children: [
          { index: true, element: <Navigate to="home" replace /> },
          { path: "home", element: <AdminHome /> },
          { path: "products", element: <AdminProducts /> },
          { path: "add/products", element: <AddProduct /> },
          { path: "view/products", element: <ViewProducts /> },
          { path: "update/products/:productId", element: <UpdateProducts /> },
          { path: "add/category", element: <AddCategory /> },
          { path: "view/category", element: <ViewCategory /> },
          { path: "update/category/:categoryId", element: <UpdateCategory /> },
          { path: "view/orders", element: <OrderList /> },
          { path: "update/order/:orderId", element: <AdminOrderDetails /> },
          { path: "view/users", element: <UsersList /> },
          { path: "update/:userId", element: <UpdateUser /> },
          { path: "view/reviews", element: <ReviewsList /> },
          { path: "*", element: <NotFoundCard title="Admin page not found" description="Choose a section from the admin navigation." /> }
        ]
      },

      // Catch-all 404 handler
      { path: "*", element: <PageNotFound /> }
    ]
  }
]);

// 4. Main Component Export
function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserAction());
  }, [dispatch]);

  // Serving the structured router engine directly to the top-level tree
  return <RouterProvider router={router} />;
}

export default App;