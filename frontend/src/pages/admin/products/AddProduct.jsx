import { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  AddProductsAction,
  clearError,
} from "../../../redux/actions/productAction";
import { getAllCategoryAction } from "../../../redux/actions/categoryAction";

import Loader from "../../../components/Loader/Loader";
import { convertQuantity } from "../../../utils/productUnits";

import "./AddProduct.css";

const AddProduct = () => {
  //get all category form state
  const {
    loading,
    Categories,
  } = useSelector((state) => state.getAllCategory);

  //add product state
  const {
    loading: productLoading,
    success,
    error: productError,
  } = useSelector((state) => {
    return state.addProduct;
  });

  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [aliases, setAliases] = useState("");
  const [rate, setRate] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [category, setCategory] = useState("");
  const [stocks, setStocks] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [quantityValues, setQuantityValues] = useState("0.5, 1");
  const [validationError, setValidationError] = useState("");

  //handel image
  const handelImageChange = (e) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setPreviewImage(window.URL.createObjectURL(e.target.files[0]));
  };

  // handel submit
  const handelAddProductSubmit = (e) => {
    e.preventDefault();
    const quantityOptions = quantityValues
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((quantity) => Number.isFinite(quantity) && quantity > 0)
      .map((quantity) => ({ quantity, unit: quantityUnit }));
    if (!category) {
      setValidationError("Choose a product category.");
    } else if (convertQuantity(1, quantityUnit, unit) === null) {
      setValidationError("Sell quantity units must be compatible with the inventory unit.");
    } else if (!quantityOptions.length) {
      setValidationError("Enter at least one valid quantity option.");
    } else {
      const productFormData = new FormData();
      productFormData.append("name", name);
      productFormData.append("description", description);
      productFormData.append("aliases", aliases);
      productFormData.append("unit", unit);
      productFormData.append("rate", rate);
      productFormData.append("stocks", stocks);
      productFormData.append("category", category);
      productFormData.append("quantityOptions", JSON.stringify(quantityOptions));
      productFormData.append("image", image);
      dispatch(AddProductsAction(productFormData));
    }
  };

  useEffect(() => {
    dispatch(getAllCategoryAction());
  }, []);

  useEffect(() => {
    if (!productError && !validationError) return undefined;
    const timer = setTimeout(() => {
      if (productError) dispatch(clearError());
      if (validationError) setValidationError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, productError, validationError]);

  return (
    <>
      <div className="dashboard-container">
        {loading || productLoading ? (
          <Loader LoadingName={"Loading Product"} />
        ) : (
          <>
            <div className="dashboard-sub-heading">
              <h1>Add Products</h1>
            </div>
            <div className="add-product-form-box">
              <form
                encType="multipart/form-data"
                onSubmit={(e) => {
                  handelAddProductSubmit(e);
                }}
              >
                <div className="product-name">
                  <input
                    type="text"
                    placeholder="Product Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="product-description">
                  <textarea
                    placeholder="Product description"
                    maxLength={5000}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="product-aliases">
                  <input
                    type="text"
                    placeholder="Common names, comma-separated"
                    value={aliases}
                    onChange={(e) => setAliases(e.target.value)}
                  />
                </div>
                <div className="product-unit">
                  <label htmlFor="product-unit">Inventory, price, and stock unit</label>
                  <select id="product-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="l">Liters (l)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="piece">Pieces</option>
                  </select>
                </div>
                <div className="product-rate">
                  <input
                    type="number"
                    placeholder={`Price per ${unit}`}
                    min="0"
                    step="0.01"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    required
                  />
                </div>
                <div className="product-stocks">
                  <input
                    type="number"
                    placeholder={`Available stock (${unit})`}
                    min="0"
                    step="any"
                    value={stocks}
                    onChange={(e) => setStocks(e.target.value)}
                    required
                  />
                </div>
                <label className="product-quantity-options">
                  Sell quantities (comma-separated)
                  <select id="quantity-unit" aria-label="Sell quantity unit" value={quantityUnit} onChange={(e) => setQuantityUnit(e.target.value)}>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="l">Liters (l)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="piece">Pieces</option>
                  </select>
                  <input
                    type="text"
                    placeholder="0.25, 0.5, 1"
                    value={quantityValues}
                    onChange={(e) => setQuantityValues(e.target.value)}
                    required
                  />
                </label>
                <br />
                <div className="product-category">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                    }}
                    required
                  >
                    <option value="">Choose Category</option>
                    {Categories &&
                      Categories.map((category) => {
                        return (
                          <option key={category._id} value={category._id}>
                            {category.categoryName}
                          </option>
                        );
                      })}
                  </select>
                </div>
                <br />
                <br />
                <div className="product-image">
                  <input
                    type="file"
                    accept="images/*"
                    required
                    onChange={(e) => {
                      handelImageChange(e);
                    }}
                  />
                </div>
                <div className="product-preview">
                  {previewImage ? <img src={previewImage} alt="" /> : ""}
                </div>
                {(validationError || productError) && (
                  <div className="upload-error">
                    <h1>{validationError || (Array.isArray(productError) ? productError.join(", ") : productError)}</h1>
                  </div>
                )}
                {success ? (
                  <div className="upload-error">
                    <h1>Product Added..!!</h1>
                  </div>
                ) : (
                  ""
                )}
                <div className="add-product-form-btn">
                  <button type="submit">Add Product</button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddProduct;