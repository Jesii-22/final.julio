import {
  requireAdmin,
} from "@/lib/apiAuth";
import {
  getCategories,
} from "@/lib/categories";
import { connectDB } from "@/lib/mongodb";

import Category from "@/models/Category";

export const dynamic =
  "force-dynamic";

/*
  La lista de categorías es pública.
*/
export async function GET() {
  try {
    const categories =
      await getCategories();

    return Response.json(categories);
  } catch (error) {
    console.error(
      "Error GET categorías:",
      error
    );

    return Response.json(
      {
        message:
          "Error al obtener las categorías",

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
  Solamente un admin puede crear.
*/
export async function POST(request) {
  try {
    const authorization =
      await requireAdmin();

    if (!authorization.ok) {
      return authorization.response;
    }

    const body =
      await request.json();

    await connectDB();

    const category =
      await Category.create({
        name: body.name,
        description:
          body.description || "",
      });

    return Response.json(
      category,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error POST categoría:",
      error
    );

    return Response.json(
      {
        message:
          "Error al crear la categoría",

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