import { connectDB } from "@/lib/mongodb";
import { getCategories } from "@/lib/categories";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();

    return Response.json(categories);
  } catch (error) {
    return Response.json(
      { message: "Error al obtener las categorias", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();

    const category = await Category.create({
      name: body.name,
      description: body.description,
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    return Response.json(
      { message: "Error al crear la categoria", error: error.message },
      { status: 400 }
    );
  }
}
