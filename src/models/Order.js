import mongoose from "mongoose";

const customerDataSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    observations: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const deliverySchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: [
        "pickup_store",
        "pickup_point",
        "shipping",
      ],
      required: true,
    },

    pointCode: {
      type: String,
      default: "",
      trim: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    zone: {
      type: String,
      default: "",
      trim: true,
    },

    schedule: {
      type: String,
      default: "",
      trim: true,
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["cash", "transfer", "card"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Rejected",
      ],
      default: "Pending",
    },

    discountPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    installments: {
      type: Number,
      enum: [1, 3],
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    customizations: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true,
      index: true,
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
      default: null,
    },

    customerData: {
      type: customerDataSchema,
      required: true,
    },

    delivery: {
      type: deliverySchema,
      required: true,
    },

    payment: {
      type: paymentSchema,
      required: true,
    },

    products: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(products) {
          return products.length > 0;
        },

        message:
          "La orden debe contener al menos un producto.",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Order) {
  const schema = mongoose.models.Order.schema;

  const needsReload =
    !schema.path("delivery") ||
    !schema.path("payment") ||
    !schema.path("subtotal") ||
    !schema.path("discountAmount");

  if (needsReload) {
    mongoose.deleteModel("Order");
  }
}

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;