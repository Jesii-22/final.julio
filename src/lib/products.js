import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { serializeCategory } from "@/lib/categories";
import "@/models/Category";
import Product from "@/models/Product";

function serializeCustomization(customization) {
  return {
    name: customization.name || "",
    options: Array.isArray(customization.options)
      ? customization.options.map((option) => String(option))
      : [],
  };
}

function serializeProduct(product) {
  return {
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image: product.image,

    categories: (product.categories || []).map((category) => {
      if (category?.name) {
        return serializeCategory(category);
      }

      return category.toString();
    }),

    customizations: (product.customizations || []).map(
      serializeCustomization
    ),

    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  };
}

export async function getProducts() {
  await connectDB();

  const products = await Product.find()
    .populate("categories")
    .sort({ createdAt: -1 })
    .lean();

  return products.map(serializeProduct);
}

export async function getProductById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  await connectDB();

  const product = await Product.findById(id)
    .populate("categories")
    .lean();

  return product ? serializeProduct(product) : null;
}

export async function getProductsByCategory(categoryId) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return [];
  }

  await connectDB();

  const products = await Product.find({
    categories: categoryId,
  })
    .populate("categories")
    .sort({ createdAt: -1 })
    .lean();

  return products.map(serializeProduct);
}

export async function getRelatedProducts(
  productId,
  categoryIds = [],
  limit = 3
) {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return [];
  }

  const validCategoryIds = categoryIds.filter((categoryId) =>
    mongoose.Types.ObjectId.isValid(categoryId)
  );

  if (validCategoryIds.length === 0) {
    return [];
  }

  await connectDB();

  const products = await Product.find({
    _id: {
      $ne: productId,
    },
    categories: {
      $in: validCategoryIds,
    },
  })
    .populate("categories")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map(serializeProduct);
}