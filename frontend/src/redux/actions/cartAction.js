import api from '../../api/axios';
import {
  ADD_RECIPE_INGREDIENTS,
  ADD_TO_CART,
  ADJUST_CART_QUANTITY,
  CLEAR_CART_ITEM,
  REMOVE_CART_ITEM,
} from "../constants/cartConstants";

// Add a single product to cart
export const addToCartAction = (id, quantity, quantityUnit) => async (dispatch, getState) => {
  const { data } = await api.get(`/api/product/getSingleProduct/${id}`);
  dispatch({
    type: ADD_TO_CART,
    payload: {
      id: data.product._id,
      name: data.product.name,
      description: data.product.description || "",
      rate: data.product.rate,
      stocks: data.product.stocks,
      unit: data.product.unit || "kg",
      quantityUnit: quantityUnit || data.product.unit || "kg",
      quantityOptions: data.product.quantityOptions || [],
      image: data.product.url,
      quantity,
    },
  });
  localStorage.setItem(
    "userCart",
    JSON.stringify(getState().userCart.cartItems)
  );
};

// Add multiple products to cart
export const addRecipeIngredientsToCartAction = (ingredients) => (dispatch, getState) => {
  const items = ingredients
    .filter((ingredient) => ingredient?.matchedProduct)
    .map(({ matchedProduct }) => ({
      id: matchedProduct.id,
      name: matchedProduct.name,
      rate: matchedProduct.rate,
      stocks: matchedProduct.stocks,
      unit: matchedProduct.unit || "kg",
      quantityUnit: matchedProduct.unit || "kg",
      quantityOptions: matchedProduct.quantityOptions || [],
      image: matchedProduct.image,
      quantity: Number(matchedProduct.cartQuantity),
    }))
    .filter((item) => item.id && Number.isFinite(item.quantity) && item.quantity > 0);

  if (items.length === 0) return;

  dispatch({ type: ADD_RECIPE_INGREDIENTS, payload: items });
  localStorage.setItem("userCart", JSON.stringify(getState().userCart.cartItems));
};

// Update the cart item quantity
export const adjustCartItemQuantityAction = (id, direction) => (dispatch, getState) => {
  dispatch({ type: ADJUST_CART_QUANTITY, payload: { id, direction } });
  localStorage.setItem("userCart", JSON.stringify(getState().userCart.cartItems));
};

// Remove a single product from cart
export const removeCartItemAction = (id) => (dispatch, getState) => {
  dispatch({ type: REMOVE_CART_ITEM, payload: id });
  localStorage.setItem(
    "userCart",
    JSON.stringify(getState().userCart.cartItems)
  );
};

// Clear cart products
export const clearCartItemAction = () => (dispatch, getState) => {
  dispatch({ type: CLEAR_CART_ITEM });
  localStorage.setItem(
    "userCart",
    JSON.stringify(getState().userCart.cartItems)
  );
};