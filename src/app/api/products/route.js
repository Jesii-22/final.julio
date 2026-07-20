import {
  requireAdmin,
} from "@/lib/apiAuth";
import { connectDB } from "@/lib/mongodb";
import { getProducts } from "@/lib/products";

import "@/models/Category";
import Product from "@/models/Product";

export const dynamic =
  "force-dynamic";

/*
  El catálogo público puede consultar
  todos los productos.
*/
export async function GET() {
  try {
    const products =
      await getProducts();

    return Response.json(products);
  } catch (error) {
    console.error(
      "Error GET productos:",
      error
    );

    return Response.json(
      {
        message:
          "Error al obtener los productos",

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
  Solamente una cuenta administradora
  puede crear productos.
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

    const product =
      await Product.create({
        name: body.name,
        description:
          body.description || "",
        price: Number(body.price),
        stock: Number(body.stock),
        image: body.image || "",
        categories:
          body.categories || [],
        customizations:
          body.customizations || [],
      });

    return Response.json(
      product,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error POST producto:",
      error
    );

    return Response.json(
      {
        message:
          "Error al crear el producto",

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