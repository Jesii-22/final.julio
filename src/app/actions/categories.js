"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

function getCategoryPayload(
  formData
) {
  return {
    name: String(
      formData.get("name") || ""
    ).trim(),

    description: String(
      formData.get("description") || ""
    ).trim(),

    icon: String(
      formData.get("icon") || ""
    ).trim(),
  };
}

function revalidateCategoryViews() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath(
    "/dashboard/products"
  );
}

export async function createCategory(
  _previousState,
  formData
) {
  try {
    await connectDB();

    await Category.create(
      getCategoryPayload(formData)
    );

    revalidateCategoryViews();

    return {
      ok: true,
      message:
        "Categoría creada correctamente.",
    };
  } catch (error) {
    return {
      ok: false,

      message:
        error.message ||
        "Error al crear la categoría.",
    };
  }
}

export async function updateCategory(
  id,
  _previousState,
  formData
) {
  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return {
      ok: false,
      message:
        "ID de categoría inválido.",
    };
  }

  try {
    await connectDB();

    const category =
      await Category.findByIdAndUpdate(
        id,
        getCategoryPayload(formData),
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!category) {
      return {
        ok: false,
        message:
          "Categoría no encontrada.",
      };
    }

    revalidateCategoryViews();

    return {
      ok: true,
      message:
        "Categoría actualizada correctamente.",
    };
  } catch (error) {
    return {
      ok: false,

      message:
        error.message ||
        "Error al actualizar la categoría.",
    };
  }
}

export async function deleteCategory(
  id
) {
  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return {
      ok: false,
      message:
        "ID de categoría inválido.",
    };
  }

  try {
    await connectDB();

    const category =
      await Category.findByIdAndDelete(
        id
      );

    if (!category) {
      return {
        ok: false,
        message:
          "Categoría no encontrada.",
      };
    }

    await Product.updateMany(
      {
        categories: category._id,
      },
      {
        $pull: {
          categories: category._id,
        },
      }
    );

    revalidateCategoryViews();

    return {
      ok: true,
      message:
        "Categoría eliminada correctamente.",
    };
  } catch (error) {
    return {
      ok: false,

      message:
        error.message ||
        "Error al eliminar la categoría.",
    };
  }
}