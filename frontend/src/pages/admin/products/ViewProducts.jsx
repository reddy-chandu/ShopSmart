import { useEffect } from "react";
import { Link } from "react-router-dom";

import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  deleteProductAction,
  getAllProductsAction,
} from "../../../redux/actions/productAction";

import Loader from "../../../components/Loader/Loader";

import { formatQuantity, formatRate, getProductQuantityOptions, getProductUnit } from "../../../utils/productUnits";

import "./ViewProducts.css";

const ViewProducts = () => {
  const dispatch = useDispatch();
  const { loading, products } = useSelector(
    (state) => state.getAllProducts
  );
  const {
    loading: deleteLoading,
    error: deleteProductError,
    success: deleteSuccess,
  } = useSelector((state) => state.deleteProduct);

  useEffect(() => {
    dispatch(getAllProductsAction());
  }, [deleteSuccess]);

  useEffect(() => {
    if (!deleteProductError) return undefined;
    const timer = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timer);
  }, [deleteProductError, dispatch]);

  //Delete Product
  const deleteProduct = (id) => {
    dispatch(deleteProductAction(id));
  };

  return (
    <>
      <div className="dashboard-container">
        {loading || deleteLoading ? (
          <Loader
            LoadingName={
              deleteLoading ? "Deleting Product" : "Fetching Products"
            }
          />
        ) : (
          <>
            <div className="dashboard-sub-heading">
              <h1>All Products</h1>
            </div>
            {deleteSuccess ? <span>{"Product Deleted..!!"}</span> : ""}
            {deleteProductError ? <span>{deleteProductError}</span> : ""}
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Image</th>
                    <th>Rate</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <strong>{product.name}</strong>
                        {product.description && <small className="admin-product-description">{product.description}</small>}
                        <small className="admin-product-description">
                          Sell options: {getProductQuantityOptions(product).map((option) =>
                            formatQuantity(option.quantity, option.unit)
                          ).join(", ") || "None"}
                        </small>
                      </td>
                      <td><img src={product.url} alt={product.name} /></td>
                      <td>{formatRate(product.rate, getProductUnit(product))}</td>
                      <td>{product.category?.categoryName || "Uncategorized"}</td>
                      <td>{product.stocks} {getProductUnit(product)}</td>
                      <td><span className={`admin-status ${product.stocks <= 0 ? "admin-status--empty" : "admin-status--ready"}`}>
                        {product.stocks <= 0 ? "Out of stock" : "In stock"}
                      </span></td>
                      <td className="admin-row-actions">
                        <Link className="admin-icon-action" aria-label={`Edit ${product.name}`} to={`/admin/update/products/${product._id}`} state={{ product }}>
                          <HiPencilAlt />
                        </Link>
                        <button className="admin-icon-action admin-icon-action--danger" type="button" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product._id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ViewProducts;