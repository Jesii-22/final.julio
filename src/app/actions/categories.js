"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import Category from "@/models/Category";
import Product from "@/models/Product";
import { connectDB } from "@/lib/mongodb";

function getCategoryPayload(formData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
  };
}

function revalidateCategoryViews() {
  revalidatePath("/");
  revalidatePath("/dashboard");
}

export async function createCategory(_previousState, formData) {
  try {
    await connectDB();
    await Category.create(getCategoryPayload(formData));
    revalidateCategoryViews();

    return { ok: true, message: "Categoria creada." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al crear la categoria.",
    };
  }
}

export async function updateCategory(id, _previousState, formData) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, message: "ID de categoria invalido." };
  }

  try {
    await connectDB();

    const category = await Category.findByIdAndUpdate(
      id,
      getCategoryPayload(formData),
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return { ok: false, message: "Categoria no encontrada." };
    }

    revalidateCategoryViews();
    return { ok: true, message: "Categoria actualizada." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al actualizar la categoria.",
    };
  }
}

export async function deleteCategory(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, message: "ID de categoria invalido." };
  }

  try {
    await connectDB();

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return { ok: false, message: "Categoria no encontrada." };
    }

    await Product.updateMany(
      { categories: category._id },
      { $pull: { categories: category._id } }
    );

    revalidateCategoryViews();
    return { ok: true, message: "Categoria eliminada." };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Error al eliminar la categoria.",
    };
  }
}
