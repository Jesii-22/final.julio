import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getProductById } from "@/lib/products";
import "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

function invalidIdResponse() {
  return Response.json({ message: "ID de producto invalido" }, { status: 400 });
}

export async function GET(_request, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    const product = await getProductById(id);

    if (!product) {
      return Response.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json(
      { message: "Error al obtener el producto", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    const body = await request.json();
    await connectDB();

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock,
        image: body.image,
        categories: body.categories,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return Response.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    return Response.json(
      { message: "Error al actualizar el producto", error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(_request, { params }) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return invalidIdResponse();
  }

  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return Response.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    return Response.json(
      { message: "Error al eliminar el producto", error: error.message },
      { status: 500 }
    );
  }
}
