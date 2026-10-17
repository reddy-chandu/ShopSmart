import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiSparkles } from "react-icons/hi2";

import api from '../../api/axios';

import {
  FaStar, FaLeaf,
  FaTruckFast,
  FaShieldHeart,
} from "react-icons/fa6";
import { FaCartPlus } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel, Scrollbar } from "swiper/modules";

import { useDispatch, useSelector } from "react-redux";
import { getAllCategoryAction } from "../../redux/actions/categoryAction";
import { getAllReviewsAction } from "../../redux/actions/reviewsAction";
import { addToCartAction } from "../../redux/actions/cartAction";

import { convertQuantity, formatQuantity, getProductQuantityOptions, formatRate, getProductUnit } from "../../utils/productUnits";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loader from "../../components/Loader/Loader";

import "./Home.css";

const Home = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();

  //getting user from user
  const { loading: userLoading, user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.userCart);

  //getting category from state
  const { loading: categoryLoading, Categories } = useSelector(
    (state) => state.getAllCategory
  );

  //getting all Reviews from state
  const {
    reviews,
    loading: reviewsLoading,
    error,
  } = useSelector((state) => state.getAllReviews);

  //Get Recent Products
  const [recentProductLoading, setRecentLoading] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});

  const getRecentProducts = async () => {
    setRecentLoading(true);
    try {
      const { data } = await api.get("/api/product/recent/products");
      setRecentProducts(data.products);
    } catch (error) {
      console.error("Could not load recent products:", error.message);
    } finally {
      setRecentLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Home";
    dispatch(getAllCategoryAction());
    dispatch(getAllReviewsAction());
    getRecentProducts();
  }, [dispatch]);

  const productSwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    mousewheel: true,
    scrollbar: {
      draggable: true,
      hide: false
    },

    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },

    modules: [Scrollbar, Mousewheel],
    className: "mySwiper",
  };

  const reviewSwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 24,
    grabCursor: true,
    loop: false,
    mousewheel: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true
    },
    scrollbar: {
      draggable: true,
      hide: false
    },

    breakpoints: {
      640: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },

    modules: [Autoplay, Scrollbar, Mousewheel],
  };

  return (
    <>
      <Header />

      {userLoading ||
        categoryLoading ||
        reviewsLoading ||
        recentProductLoading ? (
        <Loader LoadingName={"Loading Home"} />
      ) : (
        <>
          {/* Hero Section */}

          <section className="hero-section">
            <div className="hero-content">
              <h3>
                Smarter Grocery Shopping with
                <span className="highlight-text"> SmartieAI</span>
                <HiSparkles />
              </h3>

              <p>
                From fresh produce to everyday essentials, find exactly what you need
                with the help of SmartieAI. Quality products, transparent prices, and a smarter shopping
                experience delivered right to your fingertips.
              </p>

              <Link to="/products" className="cta-btn">
                Start Shopping
              </Link>
            </div>
            <div className="floating-items">
              <span className="fruit fruit-1">🥑</span>
              <span className="fruit fruit-2">🍎</span>
              <span className="fruit fruit-3">🍊</span>
              <span className="fruit fruit-4">🥕</span>
              <span className="fruit fruit-5">🥬</span>
              <span className="fruit fruit-6">🥛</span>
            </div>
          </section>

          {/* Features Section */}

          <section className="features-section" id="features">
            <div className="features-header">
              <span className="section-badge">
                Why Customers Love ShopSmart
              </span>
              <h3>
                Grocery Shopping
                <span className="highlight-text"> Made Effortless</span>
              </h3>
            </div>
            <div className="features-grid">
              <article className="feature-card">
                <div className="feature-icon">
                  <FaLeaf size={22} />
                </div>

                <h3>Farm Fresh Quality</h3>

                <p>
                  Carefully sourced fruits, vegetables, dairy, and
                  essentials delivered fresh from trusted suppliers
                  to your doorstep.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <FaTruckFast size={22} />
                </div>

                <h3>Fast & Free Delivery</h3>

                <p>
                  Get your groceries delivered quickly with free
                  shipping on all orders and real-time order
                  tracking.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <FaShieldHeart size={22} />
                </div>

                <h3>100% Secure Payments</h3>

                <p>
                  Shop confidently using trusted payment methods,
                  encrypted transactions, and cash-on-delivery
                  options.
                </p>
              </article>
            </div>
          </section>

          {/* New Products Section*/}

          <section className="new-products-section">
            <div className="products-header">
              <span className="section-badge">
                Recently Added Products
              </span>

              <h3>
                Discover Our
                <span className="highlight-text"> Fresh Arrivals</span>
              </h3>
            </div>

            <Swiper {...productSwiperOptions} className="new-products-swiper">
              {recentProducts?.map((item) => (
                <SwiperSlide key={item._id}>
                  <div
                    className="new-product-card"
                    onClick={() => Navigate(`/products?keyword=${encodeURIComponent(item.name)}`)}
                  >
                    <div className="new-badge">
                      New
                    </div>
                    {(() => {
                      const cartItem = cartItems.find((entry) => entry.id === item._id);
                      return cartItem ? (
                        <span className="home-cart-quantity-badge" aria-live="polite">
                          {formatQuantity(cartItem.quantity, cartItem.quantityUnit || cartItem.unit)} in cart
                        </span>
                      ) : null;
                    })()}

                    <div className="product-image-wrapper">
                      <img src={item.url} alt={item.name} />
                    </div>

                    <div className="product-info">
                      <h4>{item.name}</h4>

                      <p className="product-tagline">
                        {item.description}
                      </p>

                      <div className="product-footer">
                        <div className="product-price">
                          {formatRate(item.rate, getProductUnit(item))}
                        </div>
                        {(() => {
                          const unit = getProductUnit(item);
                          const quantityOptions = getProductQuantityOptions(item)
                            .filter((option) => convertQuantity(option.quantity, option.unit, unit) <= item.stocks);
                          const firstOption = quantityOptions[0];
                          const selectedKey = selectedQuantities[item._id] ??
                            (firstOption ? `${firstOption.quantity}:${firstOption.unit}` : "");
                          const selectedOption = quantityOptions.find((option) =>
                            `${option.quantity}:${option.unit}` === selectedKey
                          ) || firstOption;

                          return item.stocks <= 0 || !quantityOptions.length ? (
                            <span className="home-product-out-of-stock">Out of stock</span>
                          ) : (
                            <div className="product-cart-controls" onClick={(event) => event.stopPropagation()}>
                              <select
                                aria-label={`Quantity for ${item.name}`}
                                value={selectedKey}
                                onChange={(event) => {
                                  setSelectedQuantities((current) => ({
                                    ...current,
                                    [item._id]: event.target.value,
                                  }));
                                }}
                              >
                                {quantityOptions.map((option) => (
                                  <option key={`${option.quantity}-${option.unit}`} value={`${option.quantity}:${option.unit}`}>
                                    {formatQuantity(option.quantity, option.unit)}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="add-to-cart-btn"
                                aria-label={`Add ${item.name} to cart`}
                                onClick={() => selectedOption && dispatch(addToCartAction(item._id, selectedOption.quantity, selectedOption.unit))}
                              >
                                <FaCartPlus />
                                <span>Add</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>

          {/* Categories Section */}

          <section className="categories-section" id="categories">
            <div className="categories-header">
              <span className="section-badge">
                Shop By Category
              </span>

              <h3>
                Explore Our
                <span className="highlight-text"> Grocery Collections</span>
              </h3>
            </div>

            <div className="categories-grid">
              {Categories?.map((category) => (
                <Link
                  key={category._id}
                  to={`/products/category/${category._id}?categoryName=${encodeURIComponent(category.categoryName)}`}
                  className="category-card"
                >
                  <img src={category.categoryImage} alt="" />

                  <div className="category-overlay">
                    <div className="category-content">
                      <h4>{category.categoryName}</h4>

                      <span className="category-link">
                        Explore Collection →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Reviews Section */}

          <section className="reviews-section" id="reviews">
            <div className="reviews-header">
              <span className="section-badge">
                Customer Stories
              </span>

              <h3>
                Trusted By Thousands Of
                <span className="highlight-text"> Happy Customers</span>
              </h3>
            </div>

            <div className="reviews-stats">

              <div className="stat">
                <h4>10k+</h4>
                <span>Happy Customers</span>
              </div>

              <div className="stat">
                <h4>15k+</h4>
                <span>Orders Delivered</span>
              </div>

              <div className="stat">
                <h4>5.0<FaStar size={20}/></h4>
                <span>Average Rating</span>
              </div>

            </div>

            <Swiper {...reviewSwiperOptions} className="reviews-swiper">
              {reviews?.map((review) => (
                <SwiperSlide key={review._id}>
                  <article className="review-card">

                    <div className="review-stars">
                      {[...Array(review.ratings)].map((_, index) => (
                        <FaStar key={index} />
                      ))}
                    </div>

                    <p className="review-comment">
                      "{review.comment}"
                    </p>

                    <div className="review-user">

                      <div className="review-avatar">
                        {review.user.firstName?.charAt(0)}
                      </div>

                      <div>
                        <h4>
                          {review.user.firstName}{" "}
                          {review.user.lastName}
                        </h4>

                        <span>
                          Verified Customer
                        </span>
                      </div>

                    </div>

                  </article>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        </>
      )}
      <Footer />
    </>
  );
};

export default Home;