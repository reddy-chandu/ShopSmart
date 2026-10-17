import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { FaCartPlus } from "react-icons/fa";
import { BiFilterAlt } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

import { useDispatch, useSelector } from "react-redux";
import { getAllProductsAction } from "../../redux/actions/productAction";
import { addToCartAction } from "../../redux/actions/cartAction";
import { getAllCategoryAction } from "../../redux/actions/categoryAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";
import NotFoundCard from "../../components/NotFoundCard/NotFoundCard";

import { convertQuantity, formatQuantity, formatRate, getProductQuantityOptions, getProductUnit } from "../../utils/productUnits";

import "./Products.css";

const Products = () => {
  const dispatch = useDispatch();
  const [headingCategory, setHeadingCategory] = useState("Products");
  const [searchParams] = useSearchParams();

  //Get Product From State
  const {
    loading,
    products,
    productsCount,
    error: productError,
  } = useSelector((state) => state.getAllProducts);

  //Get Category From State
  const {
    loading: categoryLoading,
    Categories,
    error: categoryError,
  } = useSelector((state) => state.getAllCategory);

  //Get Cart Item
  const { cartItems } = useSelector((state) => state.userCart);

  //Filter Product
  const [FilterCategory, setFilterCategory] = useState([]);
  const [priceMode, setPriceMode] = useState("any");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [clearFilter, setClearFilter] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleCategory = (category) => {
    setFilterCategory((selected) =>
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category]
    );
  };

  const ApplyFilterBtnClick = () => {
    let priceValue = "";
    let comparison = "range";
    const hasInvalidPrice = (value) =>
      !Number.isFinite(Number(value)) || Number(value) < 0;

    if (priceMode === "lt") {
      if (maximumPrice === "") {
        setPriceError("Enter a maximum price.");
        return;
      }
      if (hasInvalidPrice(maximumPrice)) {
        setPriceError("Enter a valid price of zero or more.");
        return;
      }
      priceValue = maximumPrice;
      comparison = "lt";
    } else if (priceMode === "gt") {
      if (minimumPrice === "") {
        setPriceError("Enter a minimum price.");
        return;
      }
      if (hasInvalidPrice(minimumPrice)) {
        setPriceError("Enter a valid price of zero or more.");
        return;
      }
      priceValue = minimumPrice;
      comparison = "gt";
    } else if (priceMode === "between") {
      if (minimumPrice === "" || maximumPrice === "") {
        setPriceError("Enter both prices to set a range.");
        return;
      }
      if (hasInvalidPrice(minimumPrice) || hasInvalidPrice(maximumPrice)) {
        setPriceError("Enter valid prices of zero or more.");
        return;
      }
      if (Number(minimumPrice) > Number(maximumPrice)) {
        setPriceError("Minimum price must not exceed maximum price.");
        return;
      }
      priceValue = `${minimumPrice}-${maximumPrice}`;
    }

    setPriceError("");
    dispatch(getAllProductsAction(priceValue, FilterCategory, "", comparison));
    setClearFilter(true);
    setHeadingCategory("Products");
    setIsFilterOpen(false);
  };

  //Clear Filter
  const clearFilterBtnClick = () => {
    if (clearFilter) {
      dispatch(getAllProductsAction());
      dispatch(getAllCategoryAction());
      setFilterCategory([]);
      setPriceMode("any");
      setMinimumPrice("");
      setMaximumPrice("");
      setPriceError("");
      setClearFilter(false);
      setHeadingCategory("Products");
    }
  };

  //Add Product To Cart
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const AddToCart = (product) => {
    const options = getProductQuantityOptions(product)
      .filter((option) => convertQuantity(option.quantity, option.unit, getProductUnit(product)) <= product.stocks);
    const firstOption = options[0];
    const selectedKey = selectedQuantities[product._id];
    const option = options.find((item) => `${item.quantity}:${item.unit}` === selectedKey) || firstOption;
    if (option) dispatch(addToCartAction(product._id, option.quantity, option.unit));
  };

  //Get Search Keyword && Category
  const { keyword: routeKeyword, categoryId: routeCategoryId } = useParams();
  const keyword = routeKeyword || searchParams.get("keyword");
  const categoryId = routeCategoryId || searchParams.get("categoryId");
  const categoryName = searchParams.get("categoryName");

  useEffect(() => {
    document.title = `Fresh Products`;
    if (keyword) {
      dispatch(getAllProductsAction("0-1000", FilterCategory, keyword));
      dispatch(getAllCategoryAction());
      setHeadingCategory("Product");
    } else if (categoryId) {
      setFilterCategory([categoryId]);
      setClearFilter(true);
      dispatch(getAllProductsAction("0-1000", categoryId, keyword));
      dispatch(getAllCategoryAction());
      setHeadingCategory(categoryName || "Products");
    } else {
      setFilterCategory([]);
      setClearFilter(false);
      dispatch(getAllProductsAction());
      dispatch(getAllCategoryAction());
      setHeadingCategory("Products");
    }
  }, [keyword, categoryId, categoryName]);

  return (
    <>
      <Header />
      {(loading && categoryLoading) || loading ? (
        <Loader LoadingName={"Fetching Products"} />
      ) : (
        <div className="products-container">
          <h1 className="products-heading">
            Fresh <span className="highlight-text">{headingCategory}</span>
          </h1>
          {productError || categoryError ? (
            <>
              <NotFoundCard
                variant="error"
                title="Products unavailable"
                description={productError || categoryError}
              />
              <br />
            </>
          ) : (
            <>
              <div className="products-layout">
                {isFilterOpen && (
                  <button
                    className="filter-backdrop"
                    aria-label="Close filters"
                    onClick={() => setIsFilterOpen(false)}
                  />
                )}
                <aside
                  className={`products-filter${isFilterOpen ? " products-filter--open" : ""}`}
                  id="filter-section"
                  aria-label="Product filters"
                >
                  <div className="filter-heading">
                    <div>
                      <h2>Filters</h2>
                    </div>
                    <button
                      className="filter-close"
                      aria-label="Close filters"
                      onClick={() => setIsFilterOpen(false)}
                    >
                      <IoClose />
                    </button>
                  </div>

                  <div className="category-box">
                    <h3>Categories</h3>
                    <ul>
                      {Categories &&
                        Categories.map((category) => (
                          <li key={category._id}>
                            <button
                              type="button"
                              className={FilterCategory.includes(category._id) ? "selected-category" : ""}
                              aria-pressed={FilterCategory.includes(category._id)}
                              onClick={() => toggleCategory(category._id)}
                            >
                              <span className="category-check" />
                              Fresh {category.categoryName}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  <div className="price-filter">
                    <h3>Price range</h3>
                    <select
                      className="price-filter__mode"
                      value={priceMode}
                      onChange={(e) => {
                        setPriceMode(e.target.value);
                        setPriceError("");
                      }}
                    >
                      <option value="any">Any price</option>
                      <option value="lt">Less than</option>
                      <option value="gt">Greater than</option>
                      <option value="between">Between</option>
                    </select>
                    {priceMode !== "any" && (
                      <div className={`price-inputs${priceMode === "between" ? " price-inputs--between" : ""}`}>
                        {(priceMode === "gt" || priceMode === "between") && (
                          <label className="price-input">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Minimum"
                              aria-label="Minimum price"
                              value={minimumPrice}
                              onChange={(e) => {
                                setMinimumPrice(e.target.value);
                                setPriceError("");
                              }}
                            />
                          </label>
                        )}
                        {(priceMode === "lt" || priceMode === "between") && (
                          <label className="price-input">
                            <span>₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Maximum"
                              aria-label="Maximum price"
                              value={maximumPrice}
                              onChange={(e) => {
                                setMaximumPrice(e.target.value);
                                setPriceError("");
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                    {priceError && <p className="price-filter__error" role="alert">{priceError}</p>}
                  </div>

                  <div className="filter-btn">
                    <button className="apply-filter" onClick={ApplyFilterBtnClick}>Apply Filter</button>
                    {clearFilter && (
                      <button className="clearFilterBtn" onClick={clearFilterBtnClick}>
                        Clear all
                      </button>
                    )}
                  </div>
                </aside>

                <div className="products-list">
                  <div className="products-list-header">
                    <span>{products.length} fresh products found</span>
                    <button className="mobile-filter-trigger" onClick={() => setIsFilterOpen(true)} aria-label="Open filters">
                      <BiFilterAlt />
                    </button>
                  </div>
                  {products.length !== 0 ? (
                  <div className="products-list-box">
                    {products &&
                      products.map((product) => {
                        const unit = getProductUnit(product);
                        const quantityOptions = getProductQuantityOptions(product)
                          .filter((option) => convertQuantity(option.quantity, option.unit, unit) <= product.stocks);
                        const firstOption = quantityOptions[0];
                        const selectedOptionKey = selectedQuantities[product._id] ??
                          (firstOption ? `${firstOption.quantity}:${firstOption.unit}` : "");
                        const cartItem = cartItems.find((item) => item.id === product._id);
                        return (
                          <div className="product-card" key={product._id}>
                            {cartItem && (
                              <span className="product-card-item-qty">
                                {formatQuantity(cartItem.quantity, cartItem.quantityUnit || unit)} in cart
                              </span>
                            )}

                            <div className="product-image-wrap"><img src={product.url} alt={product.name} /></div>
                            <h2>{product.name}</h2>
                            {product.description && <p className="product-description-text">{product.description}</p>}
                            <div className="price">{formatRate(product.rate, unit)}</div>
                            <div className="product-qty">
                              {product.stocks <= 0 ? (
                                <h5 className="product-out-of-stock">
                                  OUT OF STOCK
                                </h5>
                              ) : (
                                <>
                                  <select
                                    value={selectedOptionKey}
                                    onChange={(e) => {
                                      setSelectedQuantities((current) => ({
                                        ...current,
                                        [product._id]: e.target.value,
                                      }));
                                    }}
                                    disabled={!quantityOptions.length}
                                  >
                                    {quantityOptions.map((option) => {
                                      return (
                                        <option key={`${option.quantity}-${option.unit}`} value={`${option.quantity}:${option.unit}`}>
                                          {formatQuantity(option.quantity, option.unit)}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <button
                                    onClick={() => {
                                      AddToCart(product);
                                    }}
                                    disabled={!quantityOptions.length}
                                  >
                                    <FaCartPlus />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <NotFoundCard
                    title="No matching products"
                    description="Try changing your search or clearing some filters."
                  />
                )}
              </div>
              </div>
              <button
                className="floating-filter-button"
                aria-label="Open product filters"
                aria-expanded={isFilterOpen}
                onClick={() => setIsFilterOpen(true)}
              >
                <BiFilterAlt />
              </button>
            </>
          )}
        </div>
      )}
      <Footer />
    </>
  );
};

export default Products;