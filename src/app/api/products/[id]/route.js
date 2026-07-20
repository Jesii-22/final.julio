import mongoose from "mongoose";

import {
  requireAdmin,
} from "@/lib/apiAuth";
import { connectDB } from "@/lib/mongodb";
import {
  getProductById,
} from "@/lib/products";

import "@/models/Category";
import Product from "@/models/Product";

export const dynamic =
  "force-dynamic";

function invalidIdResponse() {
  return Response.json(
    {
      message:
        "ID de producto inválido",
    },
    {
      status: 400,
    }
  );
}

/*
  El detalle de producto es público.
*/
export async function GET(
  _request,
  { params }
) {
  const { id } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return invalidIdResponse();
  }

  try {
    const product =
      await getProductById(id);

    if (!product) {
      return Response.json(
        {
          message:
            "Producto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error(
      "Error GET producto:",
      error
    );

    return Response.json(
      {
        message:
          "Error al obtener el producto",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}

/*
  Solamente un admin puede editar.
*/
export async function PUT(
  request,
  { params }
) {
  try {
    const authorization =
      await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return invalidIdResponse();
    }

    const body =
      await request.json();

    await connectDB();

    const product =
      await Product.findByIdAndUpdate(
        id,

        {
          name: body.name,

          description:
            body.description || "",

          price:
            Number(body.price),

          stock:
            Number(body.stock),

          image:
            body.image || "",

          categories:
            body.categories || [],

          customizations:
            body.customizations || [],
        },

        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!product) {
      return Response.json(
        {
          message:
            "Producto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error(
      "Error PUT producto:",
      error
    );

    return Response.json(
      {
        message:
          "Error al actualizar el producto",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 400,
      }
    );
  }
}

/*
  Solamente un admin puede eliminar.
*/
export async function DELETE(
  _request,
  { params }
) {
  try {
    const authorization =
      await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return invalidIdResponse();
    }

    await connectDB();

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json(
        {
          message:
            "Producto no encontrado",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      message:
        "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(
      "Error DELETE producto:",
      error
    );

    return Response.json(
      {
        message:
          "Error al eliminar el producto",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}