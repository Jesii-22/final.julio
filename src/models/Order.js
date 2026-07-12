import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Closed",
        "Shipped",
        "Canceled",
      ],
      default: "Active",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customerData: {
      name: String,
      email: String,
      address: String,
      phone: String,
      observations: String,
    },

    products: [
      {
        productId: String,
        name: String,
        image: String,
        price: Number,
        quantity: Number,
        customizations: Object,
        subtotal: Number,
      },
    ],

    total: Number,
  },
  {
    timestamps: true,
  }
);

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;