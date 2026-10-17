const mongoose = require("mongoose");
const { normalizeQuantityOptions } = require("../utils/productQuantityOptions");
const supportedUnits = ["kg", "g", "l", "ml", "piece"];

const quantityOptionSchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    unit: {
      type: String,
      enum: supportedUnits,
      required: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name: Required..!!"],
    trim: true,
  },
  aliases: {
    type: [{ type: String, trim: true, lowercase: true }],
    default: [],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000,
    default: "",
  },
  unit: {
    type: String,
    enum: supportedUnits,
    default: "kg",
    required: true,
  },
  quantityOptions: {
    type: [quantityOptionSchema],
    default: [],
  },
  rate: {
    type: Number,
    required: [true, "Price: Required..!!"],
    min: 0,
  },
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },

  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
    required: [true, "Enter Category Name"],
  },

  stocks: {
    type: Number,
    required: [true, "Stock: Required..!!"],
    min: 0,
  },
  numOfReviews: {
    type: Number,
    trim: true,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

productSchema.pre("validate", function syncQuantityOptions() {
  this.quantityOptions = normalizeQuantityOptions(this.quantityOptions, this.unit);
  this.aliases = [...new Set(this.aliases.map((alias) => String(alias || "").trim().toLowerCase()).filter(Boolean))];
});

productSchema.index({ name: "text", aliases: "text" });
productSchema.index({ category: 1, stocks: 1 });
productSchema.index({ createdAt: -1 });

const productModel = mongoose.model("products", productSchema);

module.exports = productModel;