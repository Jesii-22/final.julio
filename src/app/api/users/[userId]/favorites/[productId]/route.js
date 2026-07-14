import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import "@/models/Category";
import "@/models/Product";
import User from "@/models/User";

function serializeProduct(product) {
  return {
    _id: product._id.toString(),
    name: product.name,
    description: product.description || "",
    price: product.price,
    stock: product.stock,
    image: product.image || "",

    categories: (product.categories || []).map((category) => {
      if (category?.name) {
        return {
          _id: category._id.toString(),
          name: category.name,
          description: category.description || "",
        };
      }

      return category.toString();
    }),

    customizations: (product.customizations || []).map(
      (customization) => ({
        name: customization.name || "",
        options: Array.isArray(customization.options)
          ? customization.options.map(String)
          : [],
      })
    ),
  };
}

export async function DELETE(_request, { params }) {
  const { userId, productId } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return Response.json(
      {
        ok: false,
        message: "ID de usuario o producto inválido.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await connectDB();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          favorites: productId,
        },
      },
      {
        new: true,
      }
    ).populate({
      path: "favorites",
      populate: {
        path: "categories",
      },
    });

    if (!user) {
      return Response.json(
        {
          ok: false,
          message: "Usuario no encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      ok: true,
      message: "Producto quitado de favoritos.",
      favorites: user.favorites.map(serializeProduct),
    });
  } catch (error) {
    console.error("Error al quitar favorito:", error);

    return Response.json(
      {
        ok: false,
        message: "No se pudo quitar el producto de favoritos.",
      },
      {
        status: 500,
      }
    );
  }
}