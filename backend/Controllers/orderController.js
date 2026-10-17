const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const sendError = require("../utils/sendError");
const { convertQuantity } = require("../utils/productUnits");

const orderError = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const newOrder = async (req, res) => {
  const reservedStock = [];
  try {
    const { cartItems, shippingInfo } = req.body;
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return sendError(res, 400, "Your cart is empty.");
    }

    const productIds = new Set();
    cartItems.forEach((item) => {
      const productId = String(item?.id || item?.product || "");
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        throw orderError("Each order item must have a product and positive quantity.");
      }
      productIds.add(productId);
    });

    const products = await productModel.find({ _id: { $in: [...productIds] } });
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));
    const orderItems = [];
    const quantitiesByProduct = new Map();
    let total = 0;

    for (const item of cartItems) {
      const productId = String(item.id || item.product);
      const quantity = Number(item.quantity);
      const product = productsById.get(productId);
      if (!product) throw orderError("One or more products are no longer available.", 409);

      const productUnit = product.unit || "kg";
      const quantityUnit = item.quantityUnit || item.unit || productUnit;
      const stockQuantity = convertQuantity(quantity, quantityUnit, productUnit);
      const priceConversion = convertQuantity(1, quantityUnit, productUnit);
      if (stockQuantity === null || priceConversion === null) {
        throw orderError(`${product.name} cannot be ordered in ${quantityUnit}.`);
      }
      const productOptions = (product.quantityOptions || [])
        .map((option) => convertQuantity(Number(option.quantity), option.unit || productUnit, quantityUnit))
        .filter((option) => Number.isFinite(option) && option > 0);
      if (!productOptions.length) throw orderError(`${product.name} is not available for ordering.`, 409);
      const smallestOption = Math.min(...productOptions);
      if (Math.abs(quantity / smallestOption - Math.round(quantity / smallestOption)) > 1e-8) {
        throw orderError(`${product.name} must be ordered in increments of ${smallestOption} ${quantityUnit}.`);
      }

      const reservedQuantity = Number(((quantitiesByProduct.get(productId) || 0) + stockQuantity).toFixed(10));
      quantitiesByProduct.set(productId, reservedQuantity);
      const itemRate = Number((product.rate * priceConversion).toFixed(10));

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        quantityUnit,
        rate: itemRate,
        image: product.url,
      });
      total += itemRate * quantity;
    }

    for (const [productId, quantity] of quantitiesByProduct) {
      const product = productsById.get(productId);
      const updatedProduct = await productModel.findOneAndUpdate(
        { _id: product._id, stocks: { $gte: quantity } },
        { $inc: { stocks: -quantity } },
        { new: true }
      );
      if (!updatedProduct) throw orderError(`${product.name} does not have enough stock.`, 409);
      reservedStock.push({ productId: product._id, quantity });
    }

    const [createdOrder] = await orderModel.create([{
      user: req.user._id,
      orderItems,
      shippingInfo,
      total: Number(total.toFixed(2)),
    }]);

    res.status(200).json({
      success: true,
      newOrder: createdOrder,
    });
  } catch (error) {
    await Promise.allSettled(
      reservedStock.map(({ productId, quantity }) =>
        productModel.updateOne({ _id: productId }, { $inc: { stocks: quantity } })
      )
    );
    const statusCode = error.statusCode ||
      (["ValidationError", "CastError"].includes(error.name) ? 400 : 500);
    sendError(res, statusCode, statusCode === 500 ? "Could not place order." : error.message);
  }
};

//Get Customer Orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (userId) {
      const orders = await orderModel.find({ user: userId }).sort({ _id: -1 });
      res.status(200).json({
        success: true,
        message: "Orders Get SuccessFully",
        myOrders: orders,
      });
    } else {
      sendError(res, 400, "Invalid User Id ");
    }
  } catch (error) {
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

//Get Customer Order Details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (orderId) {
      const order = await orderModel.findOne({ _id: orderId, user: req.user._id });
      if (!order) return sendError(res, 404, "Order Not Found..!!");
      res.status(200).json({
        success: true,
        order,
      });
    } else {
      sendError(res, 400, "Invalid OrderId..!!");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

const getAdminOrderDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderId);
    if (!order) return sendError(res, 404, "Order Not Found..!!");
    res.status(200).json({ success: true, order });
  } catch (error) {
    sendError(res, error.name === "CastError" ? 400 : 500, "Could not load this order.");
  }
};

//get all orders admin
const adminAllOrders = async (req, res) => {
  try {
    const OrdersCount = await orderModel.find().countDocuments();
    const AllOrders = await orderModel
      .find()
      .sort({ _id: -1 })
      .populate("user");
    res.status(200).json({
      success: true,
      AllOrders,
      OrdersCount,
      message: "All Orders Get SuccessFully..!!",
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, "Somethings Went's Wrong..!!");
  }
};

//Admin Update Order
const AdminUpdateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (orderId) {
      const updatedOrder = await orderModel.findById(orderId);
      if (!updatedOrder) return sendError(res, 404, "Order Not Found..!!");
      const allowedNextStatus = {
        Processing: "Shipped",
        Shipped: "Delivered",
      }[updatedOrder.status];
      if (req.body.oStatus !== allowedNextStatus) {
        return sendError(res, 400, "Invalid order status transition.");
      }
      updatedOrder.status = req.body.oStatus;
      await updatedOrder.save();
      res.status(200).json({
        success: true,
        message: "Order Updated..!!",
        updatedOrder,
      });
    } else {
      sendError(res, 404, "Order Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Went,s To Wrong..!!");
  }
};

module.exports = {
  newOrder,
  getMyOrders,
  getOrderDetails,
  getAdminOrderDetails,
  adminAllOrders,
  AdminUpdateOrder,
};