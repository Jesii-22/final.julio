import mongoose from "mongoose";

import {
  requireAdmin,
} from "@/lib/apiAuth";
import {
  getCategoryById,
} from "@/lib/categories";
import { connectDB } from "@/lib/mongodb";

import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic =
  "force-dynamic";

function invalidIdResponse() {
  return Response.json(
    {
      message:
        "ID de categoría inválido",
    },
    {
      status: 400,
    }
  );
}

/*
  El detalle de categoría es público.
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
    const category =
      await getCategoryById(id);

    if (!category) {
      return Response.json(
        {
          message:
            "Categoría no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(category);
  } catch (error) {
    console.error(
      "Error GET categoría:",
      error
    );

    return Response.json(
      {
        message:
          "Error al obtener la categoría",

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

    const category =
      await Category.findByIdAndUpdate(
        id,

        {
          name: body.name,

          description:
            body.description || "",
        },

        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!category) {
      return Response.json(
        {
          message:
            "Categoría no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(category);
  } catch (error) {
    console.error(
      "Error PUT categoría:",
      error
    );

    return Response.json(
      {
        message:
          "Error al actualizar la categoría",

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

    /*
      Antes de eliminarla, quitamos la
      categoría de los productos asociados.
    */
    await Product.updateMany(
      {
        categories: id,
      },

      {
        $pull: {
          categories: id,
        },
      }
    );

    const category =
      await Category.findByIdAndDelete(id);

    if (!category) {
      return Response.json(
        {
          message:
            "Categoría no encontrada",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      message:
        "Categoría eliminada correctamente",
    });
  } catch (error) {
    console.error(
      "Error DELETE categoría:",
      error
    );

    return Response.json(
      {
        message:
          "Error al eliminar la categoría",

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