import { useEffect } from "react";
import { Link } from "react-router-dom";

import { FaTrash } from "react-icons/fa";
import { HiPencilAlt } from "react-icons/hi";

import { useDispatch, useSelector } from "react-redux";
import {
  deleteCategoryAction,
  getAllCategoryAction,
} from "../../../redux/actions/categoryAction";

import Loader from "../../../components/Loader/Loader";

import "./ViewProducts.css";

const ViewCategory = () => {
  const dispatch = useDispatch();
  const {
    loading,
    Categories,
    error: categoryError,
  } = useSelector((state) => state.getAllCategory);

  const {
    loading: deleteLoading,
    error: deleteCategoryError,
    success: deleteSuccess,
  } = useSelector((state) => state.deleteCategory);

  //Delete Product
  const deleteCategory = (id) => {
    dispatch(deleteCategoryAction(id));
  };

  useEffect(() => {
    dispatch(getAllCategoryAction());
  }, [deleteSuccess]);

  return (
    <>
      <div className="dashboard-container">
        {loading || deleteLoading ? (
          <Loader
            LoadingName={
              deleteLoading ? "Deleting Category" : "Fetching Category"
            }
          />
        ) : (
          <>
            <div className="dashboard-sub-heading">
              <h1>All Category</h1>
            </div>
            {(categoryError || deleteCategoryError) && (
              <p role="alert">{categoryError || deleteCategoryError}</p>
            )}
            <div className="products-table">
              <table>
                <thead>
                  <tr><th>Category</th><th>Image</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {Categories?.map((category) => (
                    <tr key={category._id}>
                      <td><strong>{category.categoryName}</strong></td>
                      <td><img src={category.categoryImage} alt={category.categoryName} /></td>
                      <td className="admin-row-actions">
                        <Link className="admin-icon-action" aria-label={`Edit ${category.categoryName}`} to={`/admin/update/category/${category._id}`} state={{ categoryName: category.categoryName, categoryImage: category.categoryImage }}>
                          <HiPencilAlt />
                        </Link>
                        <button className="admin-icon-action admin-icon-action--danger" type="button" aria-label={`Delete ${category.categoryName}`} onClick={() => deleteCategory(category._id)}>
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

export default ViewCategory;