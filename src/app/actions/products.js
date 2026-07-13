"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import "@/models/Category";
import Product from "@/models/Product";

function parseCustomizations(formData) {
  const customizationsValue = formData.get("customizations");

  if (!customizationsValue) {
    return [];
  }

  try {
    const parsedCustomizations = JSON.parse(customizationsValue);

    if (!Array.isArray(parsedCustomizations)) {
      return [];
    }

    return parsedCustomizations
      .map((customization) => ({
        name: String(customization.name || "").trim(),
        options: Array.isArray(customization.options)
          ? customization.options
              .map((option) => String(option).trim())
              .filter(Boolean)
          : [],
      }))
      .filter(
        (customization) =>
          customization.name && customization.options.length > 0
      );
  } catch {
    return [];
  }
}

function getProductPayload(formData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    image: String(formData.get("image") || "").trim(),

    categories: formData
      .getAll("categories")
      .filter((categoryId) =>
        mongoose.Types.ObjectId.isValid(categoryId)
      ),

    customizations: parseCustomizations(formData),
  };
}

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
}

export async function createProduct(_previousState, formData) {
  try {
    await connectDB();

    const payload = getProductPayload(formData);

    await Product.create(payload);

    revalidateProductPages();

    return {
      ok: true,
      message: "Producto creado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al crear el producto.",
    };
  }
}

export async function updateProduct(id, _previousState, formData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      message: "ID de producto inválido.",
    };
  }

  try {
    await connectDB();

    const payload = getProductPayload(formData);

    const product = await Product.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return {
        ok: false,
        message: "Producto no encontrado.",
      };
    }

    revalidateProductPages();

    return {
      ok: true,
      message: "Producto actualizado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al actualizar el producto.",
    };
  }
}

export async function deleteProduct(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      ok: false,
      message: "ID de producto inválido.",
    };
  }

  try {
    await connectDB();

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return {
        ok: false,
        message: "Producto no encontrado.",
      };
    }

    revalidateProductPages();

    return {
      ok: true,
      message: "Producto eliminado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al eliminar el producto.",
    };
  }
}