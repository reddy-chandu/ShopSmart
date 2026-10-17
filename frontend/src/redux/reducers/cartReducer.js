import {
  ADD_TO_CART,
  ADD_RECIPE_INGREDIENTS,
  ADJUST_CART_QUANTITY,
  CLEAR_CART_ITEM,
  REMOVE_CART_ITEM,
} from "../constants/cartConstants";
import { convertQuantity, getProductQuantityOptions } from "../../utils/productUnits";

// Cart reducer
export const myCartProductReducer = (state = { cartItems: [] }, action) => {
  switch (action.type) {
    case ADD_TO_CART: {
      const existingItem = state.cartItems.find((item) => item.id === action.payload.id);
      const addedQuantity = existingItem
        ? convertQuantity(
            action.payload.quantity,
            action.payload.quantityUnit || action.payload.unit,
            existingItem.quantityUnit || existingItem.unit
          )
        : Number(action.payload.quantity);
      if (!Number.isFinite(addedQuantity)) return state;
      const cartItems = existingItem
        ? state.cartItems.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: Number((Number(item.quantity) + addedQuantity).toFixed(10)) }
              : item
          )
        : [...state.cartItems, action.payload];
      return { ...state, cartItems };
    }

    case ADD_RECIPE_INGREDIENTS: {
      const cartItems = [...state.cartItems];

      action.payload.forEach((recipeItem) => {
        const existingIndex = cartItems.findIndex((item) => item.id === recipeItem.id);
        if (existingIndex === -1) {
          cartItems.push(recipeItem);
        } else {
          const existingItem = cartItems[existingIndex];
          const addedQuantity = convertQuantity(
            recipeItem.quantity,
            recipeItem.quantityUnit || recipeItem.unit,
            existingItem.quantityUnit || existingItem.unit
          );
          if (!Number.isFinite(addedQuantity)) return;
          cartItems[existingIndex] = {
            ...existingItem,
            quantity: Number((Number(existingItem.quantity) + addedQuantity).toFixed(10)),
          };
        }
      });

      return { ...state, cartItems };
    }

    case ADJUST_CART_QUANTITY: {
      const { id, direction } = action.payload;
      const item = state.cartItems.find((cartItem) => cartItem.id === id);
      if (!item || (direction !== 1 && direction !== -1)) return state;

      const quantityUnit = item.quantityUnit || item.unit || "kg";
      const quantityStep = getProductQuantityOptions(item)
        .map((option) => convertQuantity(option.quantity, option.unit, quantityUnit))
        .filter(Number.isFinite)
        .reduce((minimum, option) => Math.min(minimum, option), Infinity);
      const currentQuantity = Number(item.quantity);
      const stock = Number(item.stocks);
      const stockQuantity = convertQuantity(currentQuantity, quantityUnit, item.unit || "kg");
      const nextStockQuantity = convertQuantity(currentQuantity + direction * quantityStep, quantityUnit, item.unit || "kg");
      if (
        !Number.isFinite(quantityStep) ||
        !Number.isFinite(currentQuantity) ||
        !Number.isFinite(stock) ||
        stockQuantity === null ||
        nextStockQuantity === null
      ) {
        return state;
      }

      const quantity = Number((currentQuantity + direction * quantityStep).toFixed(10));
      if (quantity < quantityStep || nextStockQuantity > stock) return state;

      return {
        ...state,
        cartItems: state.cartItems.map((cartItem) =>
          cartItem.id === id ? { ...cartItem, quantity } : cartItem
        ),
      };
    }

    case REMOVE_CART_ITEM:
      return {
        ...state,
        cartItems: [
          ...state.cartItems.filter((item) => item.id !== action.payload),
        ],
      };

    case CLEAR_CART_ITEM:
      return {
        cartItems: [],
      };

    default:
      return state;
  }
};
