import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import api from '../../../api/axios';

import { useDispatch, useSelector } from "react-redux";
import {
  clearError,
  updateProductAction,
} from "../../../redux/actions/productAction";
import { getAllCategoryAction } from "../../../redux/actions/categoryAction";

import Loader from "../../../components/Loader/Loader";

import { convertQuantity, normalizeQuantityValues } from "../../../utils/productUnits";

const UpdateProducts = () => {
  const dispatch = useDispatch();
  const { productId } = useParams();

  const {
    loading,
    Categories,
  } = useSelector((state) => state.getAllCategory);

  const {
    loading: productLoading,
    success,
    error: productError,
    message,
  } = useSelector((state) => {
    return state.updateProduct;
  });

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [aliases, setAliases] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [rate, setRate] = useState("");
  const [stocks, setStocks] = useState("");
  const [quantityValues, setQuantityValues] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [category, setCategory] = useState("");

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

  const handelAddProductSubmit = (e) => {
    e.preventDefault();
    const quantityOptions = normalizeQuantityValues(quantityValues)
      .map((quantity) => ({ quantity, unit: quantityUnit }));
    if (!category) {
      setLoadError("Choose a product category.");
    } else if (convertQuantity(1, quantityUnit, unit) === null) {
      setLoadError("Sell quantity units must be compatible with the inventory unit.");
    } else if (!quantityOptions.length) {
      setLoadError("Enter at least one valid quantity option.");
    } else {
      setLoadError("");
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
      dispatch(updateProductAction(productId, productFormData));
    }
  };

  useEffect(() => {
    dispatch(getAllCategoryAction());
    let isMounted = true;
    api.get(`/api/product/getSingleProduct/${productId}`)
      .then(({ data }) => {
        if (!isMounted) return;
        const currentProduct = data.product;
        setName(currentProduct.name || "");
        setDescription(currentProduct.description || "");
        setAliases((currentProduct.aliases || []).join(", "));
        setUnit(currentProduct.unit || "kg");
        setRate(currentProduct.rate ?? "");
        setStocks(currentProduct.stocks ?? "");
        const existingQuantityOptions = currentProduct.quantityOptions || [];
        setQuantityUnit(existingQuantityOptions[0]?.unit || currentProduct.unit || "kg");
        setQuantityValues(normalizeQuantityValues(
          existingQuantityOptions
            .filter((option) => (option.unit || currentProduct.unit || "kg") === (existingQuantityOptions[0]?.unit || currentProduct.unit || "kg"))
            .map((option) => option.quantity)
            .join(",")
        ).join(", "));
        setPreviewImage(currentProduct.url || "");
        setCategory(currentProduct.category?._id || currentProduct.category || "");
        setIsLoadingProduct(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError("Could not load this product.");
        setIsLoadingProduct(false);
      });
    return () => { isMounted = false; };
  }, [productId, success, dispatch]);

  useEffect(() => {
    if (!productError && !loadError) return undefined;
    const timer = setTimeout(() => {
      if (productError) dispatch(clearError());
      if (loadError) setLoadError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, productError, loadError]);

  return (
    <>
      <div className="dashboard-container">
        {loading || productLoading || isLoadingProduct ? (
          <Loader LoadingName={"Loading Product"} />
        ) : (
          <>
            <div className="dashboard-sub-heading">
              <h1>Update Product</h1>
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
                    onChange={(e) => {
                      handelImageChange(e);
                    }}
                  />
                </div>
                <div className="product-preview">
                  {previewImage ? <img src={previewImage} alt="" /> : ""}
                </div>

                {(loadError || productError) ? (
                  <div className="upload-error">
                    <h1>{loadError || (Array.isArray(productError) ? productError.join(", ") : productError)}</h1>
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
                  <button type="submit">Update Product</button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UpdateProducts;