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

async function getFavoriteProducts(favoriteIds = []) {
  const validIds = favoriteIds
    .map((favoriteId) => favoriteId.toString())
    .filter((favoriteId) =>
      mongoose.Types.ObjectId.isValid(favoriteId)
    );

  if (validIds.length === 0) {
    return [];
  }

  const products = await Product.find({
    _id: {
      $in: validIds,
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

  return validIds
    .map((productId) => productsById.get(productId))
    .filter(Boolean)
    .map(serializeProduct);
}

export async function PUT(request, { params }) {
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

    const receivedFavoriteIds = Array.isArray(
      body.favoriteIds
    )
      ? body.favoriteIds
      : [];

    const uniqueFavoriteIds = [
      ...new Set(
        receivedFavoriteIds
          .map((productId) => String(productId))
          .filter((productId) =>
            mongoose.Types.ObjectId.isValid(productId)
          )
      ),
    ];

    await connectDB();

    const userExists = await User.exists({
      _id: userId,
    });

    if (!userExists) {
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

    /*
      Verificamos que los productos recibidos realmente existan.
    */
    const existingProducts =
      uniqueFavoriteIds.length > 0
        ? await Product.find({
            _id: {
              $in: uniqueFavoriteIds,
            },
          })
            .select("_id")
            .lean()
        : [];

    const existingProductIds = existingProducts.map(
      (product) => product._id.toString()
    );

    /*
      Agrega los favoritos temporales sin duplicar los que
      el usuario ya tenía guardados.
    */
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: {
          favorites: {
            $each: existingProductIds,
          },
        },
      },
      {
        new: true,
      }
    )
      .select("favorites")
      .lean();

    if (!updatedUser) {
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

    const favorites = await getFavoriteProducts(
      updatedUser.favorites
    );

    return Response.json({
      ok: true,
      message: "Favoritos sincronizados correctamente.",
      favorites,
    });
  } catch (error) {
    console.error(
      "Error PUT sincronización de favoritos:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudieron sincronizar los favoritos.",
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