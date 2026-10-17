const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0.000001 },
    quantityUnit: { type: String, default: "kg" },
    rate: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  orderItems: {
    type: [orderItemSchema],
    required: true,
    validate: [(items) => items.length > 0, "At least one order item is required"],
  },

  total: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    mobileNumber: { type: String, required: true, trim: true, match: /^\d{10}$/ },
    pinCode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  },

  status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered"],
    default: "Processing",
  },

  orderDate: {
    type: String,
    default: () =>
      new Date().toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const orderModel = mongoose.model("orders", orderSchema);

module.exports = orderModel;