import mongoose from "mongoose";

const customizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    customizations: {
      type: [customizationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
  Durante el desarrollo, Next puede conservar una versión anterior
  del modelo en memoria. Si esa versión no tiene customizations,
  eliminamos el modelo y lo volvemos a crear.
*/
if (mongoose.models.Product) {
  const existingSchema = mongoose.models.Product.schema;

  const needsReload =
    !existingSchema.path("categories") ||
    !existingSchema.path("customizations");

  if (needsReload) {
    mongoose.deleteModel("Product");
  }
}

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;