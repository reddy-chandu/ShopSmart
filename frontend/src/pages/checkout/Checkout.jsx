import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from '../../api/axios';

import { FaTrashRestore, FaMinus, FaPlus } from "react-icons/fa";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import {
  adjustCartItemQuantityAction,
  removeCartItemAction,
  clearCartItemAction
} from "../../redux/actions/cartAction";

import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

import { convertQuantity, formatQuantity, formatRate, getProductQuantityOptions, getRateForUnit } from "../../utils/productUnits";

import "./Checkout.css";

const Checkout = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.userCart);

  useEffect(() => {
    document.title = "Checkout";
  }, []);

  //Cart SubTotal
  const subTotal = (cartItems || []).reduce(
    (acc, item) => {
      const inventoryQuantity = convertQuantity(
        item.quantity,
        item.quantityUnit || item.unit,
        item.unit || "kg"
      );
      return acc + Number(item.rate) * (inventoryQuantity ?? 0);
    },
    0
  );

  //Remove Cart Item
  const RemoveCartItem = (id) => {
    dispatch(removeCartItemAction(id));
  };

  //Collect Shipping Info
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [validationError, setValidationError] = useState("");
  const [shippingData, setShippingData] = useState({});
  const [stage, setStage] = useState("cart");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    const savedAddress = user?.deliveryAddress || {};
    setAddress(savedAddress.address || "");
    setCity(savedAddress.city || "");
    setMobileNumber(savedAddress.mobileNumber || "");
    setPinCode(savedAddress.pinCode || "");
  }, [user]);

  const HandelCheckoutSubmit = (e) => {
    e.preventDefault();
    if (mobileNumber.length !== 10) {
      setValidationError("Mobile Number Should Be 10 Digit..!!");
    } else if (pinCode.length !== 6) {
      setValidationError("Pin Code Should Be 6 Digit..!!");
    } else {
      if (address.trim().length == 0 || city.trim().length == 0) {
        setValidationError("All Field Are Required..!!");
      } else {
        setShippingData({
          address,
          city,
          mobileNumber,
          pinCode,
        });
        setOrderError("");
        setStage("review");
      }
    }
  };

  useEffect(() => {
    if (!validationError) return;

    const timer = setTimeout(() => {
      setValidationError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [validationError]);

  const placeOrder = async () => {
    if (orderLoading || !user || cartItems.length === 0) return "Errors";
    setOrderLoading(true);
    setOrderError("");
    try {
      const { data } = await api.post("/api/user/new/order", {
        cartItems,
        shippingInfo: shippingData,
      });
      setPlacedOrder(data.newOrder);
      localStorage.setItem("userCart", JSON.stringify([]));
      dispatch(clearCartItemAction());
      setStage("success");
    } catch (error) {
      setOrderError(error.response?.data?.message || "Could not place your order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <Header />
      {stage === "success" ? (
        <main className="checkout-container checkout-success">
          <div className="checkout-success__mark"><FiCheck /></div>
          <span className="checkout-badge">Order confirmed</span>
          <h1>Thanks, {user?.firstName || "shopper"}.</h1>
          <p>Your order has been placed successfully.</p>
          {placedOrder?._id && <p className="checkout-success__order-id">Order #{placedOrder._id}</p>}
          <div className="checkout-success__actions">
            <button type="button" className="continue-btn" onClick={() => Navigate("/products")}>
              Continue shopping
            </button>
            <button type="button" className="checkout-secondary-btn" onClick={() => Navigate("/orders")}>
              View orders
            </button>
          </div>
        </main>
      ) : stage === "review" ? (
        <main className="checkout-container checkout-review">
          <button type="button" className="checkout-back-button" onClick={() => setStage("cart")}>
            <FiArrowLeft /> Back to cart
          </button>
          <div className="checkout-header">
            <span className="checkout-badge">Final review</span>
            <h1>Confirm your <span className="highlight-text">order</span></h1>
            <p>Check your items and delivery details before placing the order.</p>
          </div>
          <div className="checkout-review__grid">
            <section className="checkout-review__panel">
              <h2>Items ({cartItems.length})</h2>
              {cartItems.map((item) => (
                <article className="checkout-review__item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>{formatQuantity(item.quantity, item.quantityUnit || item.unit)}</p>
                    <span>{formatRate(
                      getRateForUnit(item.rate, item.unit || "kg", item.quantityUnit || item.unit),
                      item.quantityUnit || item.unit
                    )}</span>
                  </div>
                  <strong>₹{(
                    getRateForUnit(item.rate, item.unit || "kg", item.quantityUnit || item.unit) *
                    Number(item.quantity)
                  ).toFixed(2)}</strong>
                </article>
              ))}
            </section>
            <aside className="checkout-review__side">
              <section className="checkout-review__panel">
                <h2>Delivery details</h2>
                <p>{user?.firstName} {user?.lastName}</p>
                <p>{shippingData.address}</p>
                <p>{shippingData.city}, {shippingData.pinCode}</p>
                <p>{shippingData.mobileNumber}</p>
              </section>
              <section className="checkout-review__panel checkout-review__total">
                <h2>Payment summary</h2>
                <p><span>Items subtotal</span><strong>₹{subTotal.toFixed(2)}</strong></p>
                <p><span>Delivery</span><strong>Free</strong></p>
                <p className="checkout-review__grand-total"><span>Total</span><strong>₹{subTotal.toFixed(2)}</strong></p>
                {orderError && <p className="validation-error" role="alert">{orderError}</p>}
                <button type="button" className="continue-btn" onClick={placeOrder} disabled={orderLoading}>
                  {orderLoading ? "Placing order..." : "Place order"}
                </button>
              </section>
            </aside>
          </div>
        </main>
      ) : (
          <div className="checkout-container">
            <div className="checkout-header">


              {cartItems.length !== 0 &&
                <>
                  <span className="checkout-badge">
                    Secure Checkout
                  </span>
                  <h1>
                    Complete Your <span className="highlight-text">Order</span>
                  </h1>

                  <p>
                    Almost there! Review your items and provide
                    delivery details to place your order.
                  </p>
                </>
              }

            </div>

            <div className="checkout-layout">
              {cartItems.length === 0 ?
                <div className="empty-cart-card">
                  <h2>Your cart is currently empty</h2>

                  <button
                    className="continue-btn"
                    onClick={() => Navigate("/products")}
                  >
                    Browse Products
                  </button>
                </div>
                :
                <>
                  <div className="checkout-left">

                    {cartItems.length === 0 ? ("") : (
                      cartItems.map((item) => {
                        const quantityUnit = item.quantityUnit || item.unit || "kg";
                        const quantityOptions = getProductQuantityOptions(item)
                          .map((option) => convertQuantity(option.quantity, option.unit, quantityUnit))
                          .filter((quantity) => Number.isFinite(quantity));
                        const quantityStep = quantityOptions.length ? Math.min(...quantityOptions) : undefined;
                        const quantity = Number(item.quantity);
                        const nextQuantity = Number((quantity + quantityStep).toFixed(10));
                        const previousQuantity = Number((quantity - quantityStep).toFixed(10));
                        const nextStockQuantity = convertQuantity(nextQuantity, quantityUnit, item.unit || "kg");
                        const canIncrease =
                          Number.isFinite(quantityStep) && nextStockQuantity !== null && nextStockQuantity <= Number(item.stocks);
                        const canDecrease =
                          Number.isFinite(quantityStep) && previousQuantity >= quantityStep;

                        return (
                          <div
                            className="cart-product-card"
                            key={item.id}
                          >
                            <div className="product-details">
                              <img src={item.image} alt="Product Image" />
                              <div>

                                <h3>{item.name}</h3>

                                <p>
                                  {formatRate(item.rate, item.unit)}
                                </p>

                              </div>
                            </div>
                            <div className="product-actions">

                              <h4>₹{(
                                getRateForUnit(item.rate, item.unit || "kg", quantityUnit) *
                                Number(item.quantity)
                              ).toFixed(2)}</h4>
                              <div className="cart-quantity-control">
                                <div className="cart-quantity-change">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${item.name} quantity`}
                                    title="Decrease quantity"
                                    disabled={!canDecrease}
                                    onClick={() => dispatch(adjustCartItemQuantityAction(item.id, -1))}
                                  >
                                    <FaMinus />
                                  </button>
                                  <span className="cart-quantity-value">{formatQuantity(item.quantity, quantityUnit)}</span>
                                  <button
                                    type="button"
                                    aria-label={`Increase ${item.name} quantity`}
                                    title="Increase quantity"
                                    disabled={!canIncrease}
                                    onClick={() => dispatch(adjustCartItemQuantityAction(item.id, 1))}
                                  >
                                    <FaPlus />
                                  </button>
                                </div>
                              </div>
                              <button className="remove-item"
                                onClick={() =>
                                  RemoveCartItem(item.id)
                                }
                              >
                                <FaTrashRestore />
                              </button>

                            </div>
                          </div>
                        );
                      })
                    )}

                  </div>
                  {cartItems.length !== 0 &&
                    <div className="checkout-right">

                      {/* Order Summary */}

                      <div className="order-summary">

                        <h3>Order Summary</h3>

                        <div className="summary-row">
                          <span>Items</span>
                          <span>
                            {cartItems.length}
                          </span>
                        </div>

                        <div className="summary-row">
                          <span>Subtotal</span>
                          <span>
                            ₹ {subTotal}
                          </span>
                        </div>

                        <div className="summary-row">
                          <span>Delivery</span>

                          <span className="free">
                            Free
                          </span>
                        </div>

                        <div className="summary-row total">
                          <span>Total</span>
                          <span>
                            ₹ {subTotal}
                          </span>
                        </div>

                      </div>

                      {/* Shipping Form */}

                      <div className="shipping-card">

                        <h3>
                          Delivery Information
                        </h3>

                        <form onSubmit={HandelCheckoutSubmit}>

                          <input
                            type="text"
                            value={`${user?.firstName ?? "Guest"} ${user?.lastName ?? "User"}`}
                            readOnly
                            disabled
                          />

                          <input
                            type="text"
                            placeholder="Address"
                            value={address}
                            onChange={(e) =>
                              setAddress(e.target.value)
                            }
                            required
                          />

                          <input
                            type="text"
                            placeholder="City"
                            value={city}
                            onChange={(e) =>
                              setCity(e.target.value)
                            }
                            required
                          />

                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Mobile Number"
                            value={mobileNumber}
                            maxLength={10}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            required
                          />

                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Pin Code"
                            value={pinCode}
                            maxLength={6}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            required
                          />

                          <button type="submit" className="continue-btn">
                            Proceed to Checkout
                          </button>
                          {validationError && (<p className="validation-error">{validationError}</p>)}

                        </form>

                      </div>

                    </div>
                  }
                </>
              }
            </div>

          </div>
      )}
      <Footer />
    </>
  );
};

export default Checkout;