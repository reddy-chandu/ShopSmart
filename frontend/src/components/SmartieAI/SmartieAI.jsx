import { useEffect, useRef, useState } from "react";

import api from '../../api/axios';

import { FaRobot } from "react-icons/fa";
import { FiSend, FiX } from "react-icons/fi";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useDispatch, useSelector } from "react-redux";
import {
  addRecipeIngredientsToCartAction,
  addToCartAction,
} from "../../redux/actions/cartAction";

import { convertQuantity, formatQuantity, formatRate } from "../../utils/productUnits";

import "./SmartieAI.css";

const SmartieAI = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.userCart?.cartItems || []);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi! I’m SmartieAI. How can I help with your shopping today?",
    },
  ]);
  const [hasOpenedChat, setHasOpenedChat] = useState(false);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const isOpenRef = useRef(false);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  const [isSending, setIsSending] = useState(false);
  const [addedRecipeIds, setAddedRecipeIds] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [addingProductKeys, setAddingProductKeys] = useState([]);
  const [addedProductKeys, setAddedProductKeys] = useState([]);
  const messagesEndRef = useRef(null);
  const smartieAiRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        smartieAiRef.current &&
        !smartieAiRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const history = messages.map(({ sender, text }) => ({ sender, text }));
    const userMessage = { id: Date.now(), sender: "user", text: trimmedMessage };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage("");
    setIsSending(true);

    try {
      const { data } = await api.post("/api/chat/message", {
        message: trimmedMessage,
        history,
        cartItems: cartItems.map(({ id, name, quantity, quantityUnit, unit }) => ({
          id,
          name,
          quantity,
          quantityUnit: quantityUnit || unit,
        })),
      });

      if (!isOpenRef.current) {
        setHasUnreadMessage(true);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          sender: "bot",
          text: data.reply,
          recipe: data.recipe || null,
          products: data.products || [],
        },
      ]);
    } catch (error) {
      if (!isOpenRef.current) {
        setHasUnreadMessage(true);
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          sender: "bot",
          text:
            error.response?.data?.message ||
            "I couldn’t reach the assistant right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleAddRecipeToCart = (chatMessage) => {
    if (!chatMessage.recipe || addedRecipeIds.includes(chatMessage.id)) return;

    const ingredients = (chatMessage.recipe.ingredients || []).map((ingredient) => {
      if (!ingredient.matchedProduct) return ingredient;
      const quantityKey = `${chatMessage.id}-${ingredient.matchedProduct.id}`;
      const selectedQuantity = selectedQuantities[quantityKey] ?? ingredient.matchedProduct.cartQuantity;
      return {
        ...ingredient,
        matchedProduct: {
          ...ingredient.matchedProduct,
          cartQuantity: Number(selectedQuantity) || 0,
        },
      };
    });
    dispatch(
      addRecipeIngredientsToCartAction(ingredients)
    );
    setAddedRecipeIds((currentIds) => [...currentIds, chatMessage.id]);
  };

  const handleAddProductToCart = async (chatMessageId, product, selectedQuantity) => {
    const quantity = Number(selectedQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    const productKey = `${chatMessageId}-${product.id}`;
    setAddingProductKeys((currentKeys) => [...currentKeys, productKey]);
    try {
      await dispatch(addToCartAction(product.id, quantity));
      setAddedProductKeys((currentKeys) => [...currentKeys, productKey]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          sender: "bot",
          text: error.response?.data?.message || "I couldn’t add that product to your cart. Please try again.",
        },
      ]);
    } finally {
      setAddingProductKeys((currentKeys) => currentKeys.filter((key) => key !== productKey));
    }
  };

  const handleQuantityChange = (messageId, productId, value) => {
    setSelectedQuantities((currentQuantities) => ({
      ...currentQuantities,
      [`${messageId}-${productId}`]: value === "" ? "" : Number(value),
    }));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form.requestSubmit();
    }
  };

  return (
    <div ref={smartieAiRef} className={`smartie-ai ${isOpen ? "smartie-ai--open" : ""}`}>
      {isOpen && (
        <section className="smartie-ai__window" aria-label="SmartieAI chat">
          <header className="smartie-ai__header">
            <div className="smartie-ai__identity">
              <span className="smartie-ai__header-icon" aria-hidden="true">
                <FaRobot size={20} />
              </span>
              <div>
                <h2>SmartieAI</h2>
                <p><span aria-hidden="true" /> Online</p>
              </div>
            </div>
            <button
              type="button"
              className="smartie-ai__close"
              aria-label="Close SmartieAI chat"
              onClick={() => setIsOpen(false)}
            >
              <FiX />
            </button>
          </header>

          <div className="smartie-ai__messages" aria-live="polite">
            {messages.map((chatMessage) => (
              <div
                className={`smartie-ai__message smartie-ai__message--${chatMessage.sender}${chatMessage.recipe ? " smartie-ai__message--recipe" : ""}${chatMessage.products?.length ? " smartie-ai__message--products" : ""}`}
                key={chatMessage.id}
              >
                {chatMessage.sender === "bot" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {chatMessage.text}
                  </ReactMarkdown>
                ) : (
                  chatMessage.text
                )}
                {chatMessage.recipe && (
                  <div className="smartie-ai__recipe">
                    <div className="smartie-ai__recipe-heading">
                      <h3>{chatMessage.recipe.title}</h3>
                      <p>
                        {[chatMessage.recipe.servings, chatMessage.recipe.prepTime, chatMessage.recipe.cookTime]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    <h4>Ingredients</h4>
                    <ul className="smartie-ai__recipe-ingredients">
                      {(chatMessage.recipe.ingredients || []).map((ingredient, index) => {
                        const matchedProduct = ingredient.matchedProduct;
                        const alreadyInCart = matchedProduct &&
                          matchedProduct.existingQuantity >= matchedProduct.requiredCartQuantity;

                        return (
                          <li
                            className={alreadyInCart ? "smartie-ai__recipe-ingredient--already-in-cart" : ""}
                            key={`${ingredient.name}-${index}`}
                          >
                            <div>
                              <strong>{ingredient.name}</strong>
                              <span>
                                {[ingredient.quantity, ingredient.unit]
                                  .filter(Boolean)
                                  .join(" ") || "As needed"}
                              </span>
                              {alreadyInCart ? (
                                <small className="smartie-ai__already-in-cart">Already in cart</small>
                              ) : matchedProduct ? (
                                <small>
                                  ShopSmart match: {matchedProduct.name}
                                  {` · ${formatRate(matchedProduct.rate, matchedProduct.unit)}`}
                                </small>
                              ) : (
                                <small className="smartie-ai__unmatched">
                                  Not in-stock
                                </small>
                              )}
                              {!alreadyInCart && matchedProduct?.cartQuantity === 0 && (
                                <small className="smartie-ai__already-in-cart">
                                  No additional stock available
                                </small>
                              )}
                            </div>
                            {matchedProduct && (
                              <img
                                src={matchedProduct.image}
                                alt=""
                                loading="lazy"
                              />
                            )}
                            {matchedProduct && !alreadyInCart && (
                              matchedProduct.cartQuantityOptions?.length > 0 ? (
                                <select
                                  className="smartie-ai__quantity-select"
                                  aria-label={`Quantity of ${matchedProduct.name} to add`}
                                  value={selectedQuantities[`${chatMessage.id}-${matchedProduct.id}`] ??
                                    (matchedProduct.cartQuantity || "")}
                                  onChange={(event) => handleQuantityChange(
                                    chatMessage.id,
                                    matchedProduct.id,
                                    event.target.value
                                  )}
                                >
                                  {!matchedProduct.cartQuantity && (
                                    <option value="">Choose quantity</option>
                                  )}
                                  {matchedProduct.cartQuantityOptions.map((quantity) => (
                                    <option value={quantity} key={quantity}>
                                      {formatQuantity(quantity, matchedProduct.unit)}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <span className="smartie-ai__cart-quantity">Unavailable</span>
                              )
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    {chatMessage.recipe.instructions?.length > 0 && (
                      <>
                        <h4>Method</h4>
                        <ol className="smartie-ai__recipe-method">
                          {chatMessage.recipe.instructions.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                          ))}
                        </ol>
                      </>
                    )}

                    <button
                      type="button"
                      className="smartie-ai__add-recipe"
                      disabled={
                        addedRecipeIds.includes(chatMessage.id) ||
                        !chatMessage.recipe.ingredients?.some((item) => {
                          if (!item.matchedProduct) return false;
                          const quantityKey = `${chatMessage.id}-${item.matchedProduct.id}`;
                          return Number(selectedQuantities[quantityKey] ?? item.matchedProduct.cartQuantity) > 0;
                        })
                      }
                      onClick={() => handleAddRecipeToCart(chatMessage)}
                    >
                      {addedRecipeIds.includes(chatMessage.id)
                        ? "Ingredients added to cart"
                        : chatMessage.recipe.ingredients?.some((item) => {
                          if (!item.matchedProduct) return false;
                          const quantityKey = `${chatMessage.id}-${item.matchedProduct.id}`;
                          return Number(selectedQuantities[quantityKey] ?? item.matchedProduct.cartQuantity) > 0;
                        })
                          ? "Add All Ingredients to Cart"
                          : "No additional quantity selected or available"}
                    </button>
                  </div>
                )}
                {chatMessage.products?.length > 0 && (
                  <div className="smartie-ai__products">
                    {chatMessage.products.map((product) => {
                      const quantityKey = `${chatMessage.id}-${product.id}`;
                      const cartItem = cartItems.find((item) => item.id === product.id);
                      const existingCartQuantity = cartItem
                        ? convertQuantity(
                          cartItem.quantity,
                          cartItem.quantityUnit || cartItem.unit || product.unit,
                          product.unit
                        ) ?? Number(product.existingQuantity || 0)
                        : Number(product.existingQuantity || 0);
                      const remainingStock = Number(product.stocks) - existingCartQuantity;
                      const availableQuantities = product.quantityOptions.filter(
                        (quantity) => quantity <= remainingStock
                      );
                      const requestedSelection = selectedQuantities[quantityKey] ?? product.defaultQuantity;
                      const selectedQuantity = availableQuantities.includes(Number(requestedSelection))
                        ? Number(requestedSelection)
                        : availableQuantities[0] || 0;
                      const productKey = `${chatMessage.id}-${product.id}`;
                      const isAdding = addingProductKeys.includes(productKey);
                      const isAdded = addedProductKeys.includes(productKey);
                      return (
                        <article className="smartie-ai__product" key={product.id}>
                          <img src={product.image} alt="" loading="lazy" />
                          <div className="smartie-ai__product-details">
                            <div className="smartie-ai__product-detail">
                              <strong>{product.name}</strong>
                              <span>
                                {formatRate(product.rate, product.unit)}
                              </span>
                            </div>
                            {existingCartQuantity > 0 && (
                              <small>
                                {formatQuantity(existingCartQuantity, product.unit)} in cart
                              </small>
                            )}
                            {product.requestedQuantityUnavailable && (
                              <small>Requested amount exceeds stock; maximum available selected.</small>
                            )}
                          </div>
                          <label className="smartie-ai__product-quantity">
                            <span>Quantity</span>
                            <select
                              aria-label={`Quantity of ${product.name}`}
                              value={selectedQuantity}
                              disabled={isAdding || isAdded}
                              onChange={(event) => handleQuantityChange(
                                chatMessage.id,
                                product.id,
                                event.target.value
                              )}
                            >
                              {!availableQuantities.length && (
                                <option value={0}>No more stock</option>
                              )}
                              {availableQuantities.map((quantity) => (
                                <option value={quantity} key={quantity}>
                                  {formatQuantity(quantity, product.unit)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button
                            type="button"
                            className="smartie-ai__add-product"
                            disabled={isAdding || isAdded || selectedQuantity <= 0}
                            onClick={() => handleAddProductToCart(chatMessage.id, product, selectedQuantity)}
                          >
                            {isAdded
                              ? "Added to Cart"
                              : isAdding
                              ? "Adding..."
                              : selectedQuantity > 0
                                ? "Add to Cart" : "No more stock"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {isSending && (
              <div className="smartie-ai__message smartie-ai__message--bot smartie-ai__thinking">
                <span>SmartieAI is thinking</span>

                <div className="smartie-ai__dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="smartie-ai__form" onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Type a message..."}
              rows={1}
              maxLength={150}
              disabled={isSending}
              aria-label="Message SmartieAI"
            />
            {message.trim() && (
              <button
                type="submit"
                className="smartie-ai__send"
                aria-label="Send message"
              >
                <FiSend />
              </button>
            )}
          </form>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          className={`ai-agent-button ${!hasOpenedChat ? "ai-agent-button--animated" : ""
            }`}
          aria-label="Open SmartieAI chat"
          aria-expanded={false}
          onClick={() => {
            setIsOpen(true);
            setHasOpenedChat(true);
            setHasUnreadMessage(false);
          }}
        >
          {hasUnreadMessage && (
            <span className="ai-agent-button__notification"></span>
          )}

          <span className={`ai-agent-button__icon ${!hasOpenedChat ? "ai-agent-button__icon--animated" : ""
            }`} aria-hidden="true">
            <FaRobot size={20} />
          </span>
          <span className="ai-agent-button__content">
            <strong>SmartieAI</strong>
          </span>
        </button>
      )}
    </div>
  );
};

export default SmartieAI;