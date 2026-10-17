import { Link } from "react-router-dom";

import { FiArrowRight, FiFolderPlus, FiPackage, FiPlus, FiTag } from "react-icons/fi";

const AdminProducts = () => {
  return (
    <div className="dashboard-container admin-catalog-page">
      <header className="dashboard-heading">
        <div><span className="admin-dashboard__eyebrow">Store setup</span><h1>Catalog</h1></div>
      </header>
      <section className="admin-catalog-grid" aria-label="Catalog actions">
        <Link className="admin-catalog-card" to="/admin/add/products">
          <span className="admin-catalog-card__icon"><FiPlus /></span>
          <span><strong>Add product</strong><small>Create an item with pricing, stock, and sell options.</small></span>
          <FiArrowRight className="admin-catalog-card__arrow" />
        </Link>
        <Link className="admin-catalog-card" to="/admin/view/products">
          <span className="admin-catalog-card__icon"><FiPackage /></span>
          <span><strong>Manage products</strong><small>Review inventory and update product details.</small></span>
          <FiArrowRight className="admin-catalog-card__arrow" />
        </Link>
        <Link className="admin-catalog-card" to="/admin/add/category">
          <span className="admin-catalog-card__icon"><FiFolderPlus /></span>
          <span><strong>Add category</strong><small>Organize the catalog into useful collections.</small></span>
          <FiArrowRight className="admin-catalog-card__arrow" />
        </Link>
        <Link className="admin-catalog-card" to="/admin/view/category">
          <span className="admin-catalog-card__icon"><FiTag /></span>
          <span><strong>Manage categories</strong><small>Edit category names and images.</small></span>
          <FiArrowRight className="admin-catalog-card__arrow" />
        </Link>
      </section>
      </div>
  );
};

export default AdminProducts;