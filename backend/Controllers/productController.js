const productModel = require("../models/productModel");
const coludinary = require("cloudinary");
const sendError = require("../utils/sendError");
const { filterData } = require("../utils/filterQuery");
const {
  normalizeQuantityOptions,
  expandQuantityOptions,
  normalizeUnit,
} = require("../utils/productQuantityOptions");
const { convertQuantity } = require("../utils/productUnits");

const normalizeProductResponse = (product) => {
  const data = product.toObject ? product.toObject() : product;
  return {
    ...data,
    unit: data.unit || "kg",
    aliases: data.aliases || [],
    quantityOptions: normalizeQuantityOptions(data.quantityOptions, data.unit || "kg"),
  };
};

const parseList = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [value];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
};

const getProductOptions = (unit, quantityOptions) => {
  const options = expandQuantityOptions(parseList(quantityOptions), unit)
    .map((option) => ({
      quantity: Number(option.quantity),
      unit: normalizeUnit(option.unit, unit),
    }));
  if (options.some((option) => convertQuantity(1, option.unit, unit) === null)) return null;
  return normalizeQuantityOptions(options, unit);
};

//Add Product
const addProduct = async (req, res) => {
  try {
    const { name, description, rate, stocks, category, image } = req.body;
    const unit = req.body.unit || "kg";
    const quantityOptions = getProductOptions(unit, req.body.quantityOptions);
    if (!quantityOptions) return sendError(res, 400, "Sell quantity units must be compatible with the inventory unit.");
    if (!quantityOptions.length) return sendError(res, 400, "At least one quantity option is required.");
    if (!image) return sendError(res, 400, "Product image is required.");

    const result = await coludinary.v2.uploader.upload(image, {
      folder: "products",
    });

    const newProduct = await productModel.create({
      name,
      description,
      aliases: parseList(req.body.aliases),
      unit,
      rate,
      stocks,
      category,
      quantityOptions,
      public_id: result.public_id,
      url: result.secure_url || result.url,
    });

    res.status(201).json({
      success: true,
      message: "Product Add SuccessFully..!!",
      newProduct,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).map((key) => {
        errors[key] = error.errors[key].message;
      });
      sendError(res, 400, Object.values(errors));
    } else {
      console.log(error);
      sendError(res, 400, error.message || "Something went wrong.");
    }
  }
};

//Delete Product
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (productId) {
      const isProductExit = await productModel.findById(productId);
      if (isProductExit) {
        const DeletedProduct = await productModel
          .findByIdAndDelete(productId)
          .populate("category");
        res.status(200).json({
          success: true,
          message: "Product Delete SuccessFully..!!",
          DeletedProduct,
        });
      } else {
        sendError(res, 400, "Product Not Found");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

//Update Products
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    if (!product) return sendError(res, 404, "Product Not Found");

    const { name, description, rate, category, stocks, image } = req.body;
    const unit = req.body.unit || product.unit || "kg";
    const hasQuantityOptions = req.body.quantityOptions !== undefined;
    if (unit !== (product.unit || "kg") && (!hasQuantityOptions || stocks === undefined)) {
      return sendError(res, 400, "Changing a product unit requires new quantity options and stock.");
    }
    if (hasQuantityOptions) {
      const quantityOptions = getProductOptions(unit, req.body.quantityOptions);
      if (!quantityOptions) return sendError(res, 400, "Sell quantity units must be compatible with the inventory unit.");
      if (!quantityOptions.length) return sendError(res, 400, "At least one quantity option is required.");
      product.quantityOptions = quantityOptions;
    }
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (req.body.aliases !== undefined) product.aliases = parseList(req.body.aliases);
    if (req.body.unit !== undefined) product.unit = unit;
    if (rate !== undefined) product.rate = rate;
    if (category !== undefined) product.category = category;
    if (stocks !== undefined) product.stocks = stocks;
    if (image) {
      const result = await coludinary.v2.uploader.upload(image, { folder: "products" });
      product.url = result.secure_url || result.url;
      product.public_id = result.public_id;
    }

    await product.save();
    res.status(200).json({ success: true, message: "Product Updated..!!", product });
  } catch (error) {
    console.log(error);
    sendError(res, error.name === "ValidationError" ? 400 : 500, error.message);
  }
};

//Retrieve All Products
const getAllProduct = async (req, res) => {
  try {
    const queryStr = filterData(productModel.find(), req.query);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : null;
    if (limit) queryStr.skip((page - 1) * limit).limit(limit);
    const [products, productsDocCount] = await Promise.all([
      queryStr.populate("category").sort({ createdAt: -1, _id: -1 }).lean(),
      filterData(productModel.find(), req.query).countDocuments(),
    ]);
    res.status(200).json({
      success: true,
      message: "Product Retrieve SuccessFully..!!",
      products: products.map(normalizeProductResponse),
      productsDocCount,
      ...(limit ? { pagination: { page, limit, pages: Math.ceil(productsDocCount / limit) } } : {}),
    });
  } catch (error) {
    console.log(error);
    sendError(res, 400, error.message);
  }
};

//Retrieve First Five Products
const getRecentProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1, _id: -1 }).limit(10).lean();
    res.status(200).json({
      success: true,
      products: products.map(normalizeProductResponse),
    });
  } catch (error) {
    sendError(res, 400, "Something Is Wrong..!!");
  }
};

//Retrieve Single Product
const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (productId) {
      const product = await productModel
        .findById(productId)
        .populate("category");

      if (product) {
        res.status(200).json({
          success: true,
          message: "Product Retrieve SuccessFully..!!",
          product: normalizeProductResponse(product),
        });
      } else {
        sendError(res, 400, "Product Not Found..!!");
      }
    } else {
      sendError(res, 400, "Product Id Not Found");
    }
  } catch (error) {
    console.log(error.message);
    sendError(res, 400, "Somethings Is Wrong..!!");
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProduct,
  getRecentProducts,
  getSingleProduct,
};