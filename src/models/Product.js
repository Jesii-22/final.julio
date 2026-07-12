import mongoose from "mongoose";

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

options: [
  {
    name: String,
    values: [String],
  },
],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Product && !mongoose.models.Product.schema.path("categories")) {
  mongoose.deleteModel("Product");
}

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
