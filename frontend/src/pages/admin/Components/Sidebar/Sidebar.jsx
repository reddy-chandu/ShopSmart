import { NavLink } from "react-router-dom";

import {
  FiGrid,
  FiHome,
  FiLayers,
  FiMessageSquare,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import "./Sidebar.css";

const Sidebar = ({ isOpen = false, onNavigate = () => {} }) => {
  const linkClass = ({ isActive }) => `admin-nav__link${isActive ? " is-active" : ""}`;

  return (
    <aside className={`admin-sidebar${isOpen ? " admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__workspace">
        <span className="admin-sidebar__workspace-icon"><FiGrid /></span>
        <div><strong>Workspace</strong><small>Store management</small></div>
      </div>
      <nav className="admin-nav" aria-label="Admin navigation">
        <span className="admin-nav__label">Overview</span>
        <NavLink end to="/admin/home" className={linkClass} onClick={onNavigate}>
          <FiHome /><span>Dashboard</span>
        </NavLink>

        <span className="admin-nav__label">Store</span>
        <NavLink to="/admin/products" className={linkClass} onClick={onNavigate}>
          <FiLayers /><span>Catalog</span>
        </NavLink>
        <NavLink to="/admin/view/products" className={linkClass} onClick={onNavigate}>
          <FiPackage /><span>Products</span>
        </NavLink>
        <NavLink to="/admin/view/category" className={linkClass} onClick={onNavigate}>
          <FiTag /><span>Categories</span>
        </NavLink>

        <span className="admin-nav__label">People & sales</span>
        <NavLink to="/admin/view/orders" className={linkClass} onClick={onNavigate}>
          <FiShoppingCart /><span>Orders</span>
        </NavLink>
        <NavLink to="/admin/view/users" className={linkClass} onClick={onNavigate}>
          <FiUsers /><span>Users</span>
        </NavLink>
        <NavLink to="/admin/view/reviews" className={linkClass} onClick={onNavigate}>
          <FiMessageSquare /><span>Reviews</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;