"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import "@/models/Category";
import Product from "@/models/Product";

function getProductPayload(formData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    image: formData.get("image"),
    categories: formData
      .getAll("categories")
      .filter((categoryId) => mongoose.Types.ObjectId.isValid(categoryId)),
  };
}

function revalidateProductsDashboard() {
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createProduct(_previousState, formData) {
  try {
    await connectDB();
    await Product.create(getProductPayload(formData));
    revalidateProductsDashboard();

    return { ok: true, message: "Producto creado." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al crear el producto.",
    };
  }
}

export async function updateProduct(id, _previousState, formData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, message: "ID de producto invalido." };
  }

  try {
    await connectDB();

    const product = await Product.findByIdAndUpdate(id, getProductPayload(formData), {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return { ok: false, message: "Producto no encontrado." };
    }

    revalidateProductsDashboard();
    return { ok: true, message: "Producto actualizado." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al actualizar el producto.",
    };
  }
}

export async function deleteProduct(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, message: "ID de producto invalido." };
  }

  try {
    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return { ok: false, message: "Producto no encontrado." };
    }

    revalidateProductsDashboard();
    return { ok: true, message: "Producto eliminado." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al eliminar el producto.",
    };
  }
}
