import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import User from "@/models/User";

function serializeProduct(product) {
  return {
    _id: product._id.toString(),
    name: product.name || "",
    description: product.description || "",
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    image: product.image || "",

    categories: (product.categories || [])
      .filter(Boolean)
      .map((category) => {
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
          ? customization.options.map((option) => String(option))
          : [],
      })
    ),

    createdAt: product.createdAt?.toISOString?.(),
    updatedAt: product.updatedAt?.toISOString?.(),
  };
}

async function getFavoriteProducts(user) {
  const favoriteIds = (user.favorites || [])
    .map((favoriteId) => favoriteId.toString())
    .filter((favoriteId) =>
      mongoose.Types.ObjectId.isValid(favoriteId)
    );

  if (favoriteIds.length === 0) {
    return [];
  }

  const products = await Product.find({
    _id: {
      $in: favoriteIds,
    },
  })
    .populate({
      path: "categories",
      model: Category,
    })
    .lean();

  const productsById = new Map(
    products.map((product) => [
      product._id.toString(),
      product,
    ])
  );

  return favoriteIds
    .map((favoriteId) => productsById.get(favoriteId))
    .filter(Boolean)
    .map(serializeProduct);
}

export async function GET(_request, { params }) {
  const { userId } = await params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return Response.json(
      {
        ok: false,
        message: "ID de usuario inválido.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await connectDB();

    const user = await User.findById(userId)
      .select("favorites")
      .lean();

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

    const favorites = await getFavoriteProducts(user);

    return Response.json({
      ok: true,
      favorites,
    });
  } catch (error) {
    console.error("Error GET favoritos:", error);

    return Response.json(
      {
        ok: false,
        message: "No se pudieron obtener los favoritos.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request, { params }) {
  const { userId } = await params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return Response.json(
      {
        ok: false,
        message: "ID de usuario inválido.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const body = await request.json();
    const productId = String(body.productId || "");

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return Response.json(
        {
          ok: false,
          message: "ID de producto inválido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const productExists = await Product.exists({
      _id: productId,
    });

    if (!productExists) {
      return Response.json(
        {
          ok: false,
          message: "Producto no encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          favorites: productId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("favorites")
      .lean();

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

    const favorites = await getFavoriteProducts(user);

    return Response.json({
      ok: true,
      message: "Producto agregado a favoritos.",
      favorites,
    });
  } catch (error) {
    console.error("Error POST favoritos:", error);

    return Response.json(
      {
        ok: false,
        message: "No se pudo agregar el favorito.",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}