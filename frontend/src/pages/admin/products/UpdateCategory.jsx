import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  getAllCategoryAction,
  updateCategoryAction,
} from "../../../redux/actions/categoryAction";

const UpdateCategory = () => {
  const Location = useLocation();
  const { categoryId } = useParams();

  const dispatch = useDispatch();
  const { Categories = [] } = useSelector((state) => state.getAllCategory);
  const loadedCategory = Categories.find((item) => item._id === categoryId);

  const [categoryName, setCategoryName] = useState(
    Location.state?.categoryName || ""
  );

  const [categoryImage, setCategoryImage] = useState("");

  const [previewImage, setPreviewImage] = useState(
    Location.state?.categoryImage || ""
  );

  //handel image
  const handelImageChange = (e) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        setCategoryImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setPreviewImage(window.URL.createObjectURL(e.target.files[0]));
  };

  const { loading, success, error, message } = useSelector(
    (state) => state.adminUpdateCategory
  );

  useEffect(() => {
    if (!Location.state?.categoryName && !loadedCategory) dispatch(getAllCategoryAction());
  }, [dispatch, loadedCategory, Location.state?.categoryName]);

  useEffect(() => {
    if (!loadedCategory || Location.state?.categoryName) return;
    setCategoryName(loadedCategory.categoryName || "");
    setPreviewImage(loadedCategory.categoryImage || "");
  }, [loadedCategory, Location.state?.categoryName]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => dispatch(clearError()), 5000);
    return () => clearTimeout(timer);
  }, [dispatch, error]);

  //handel submit
  const handelUpdateCategorySubmit = (e) => {
    e.preventDefault();
    const categoryData = new FormData();
    if (categoryImage !== "") {
      categoryData.append("categoryImage", categoryImage);
    }
    categoryData.append("categoryName", categoryName);
    dispatch(updateCategoryAction(categoryId, categoryData));
  };

  return (
    <>
      <div className="dashboard-container">
        <div className="dashboard-sub-heading">
          <h1>Update Category</h1>
        </div>
        <div className="add-product-form-box">
          <form onSubmit={(e) => handelUpdateCategorySubmit(e)}>
            <div className="product-name">
              <input
                type="text"
                value={categoryName}
                placeholder="Category Name"
                required
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="product-image">
              <input
                type="file"
                accept="images/*"
                onChange={(e) => handelImageChange(e)}
              />
            </div>
            <div className="product-preview">
              {previewImage ? <img src={previewImage} alt="" /> : ""}
            </div>
            {error ? (
              <div className="upload-error">
                <h1>{error}</h1>
              </div>
            ) : (
              ""
            )}

            {success ? (
              <div className="upload-error">
                <h1>{message}</h1>
              </div>
            ) : (
              ""
            )}
            <div className="add-product-form-btn">
              <button>Update Category</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateCategory;