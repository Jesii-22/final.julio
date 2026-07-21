import Link from "next/link";
import { notFound } from "next/navigation";

import ProductGrid from "@/components/ProductGrid";
import { getCategoryById } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CategoryProductsPage({
  params,
}) {
  const { idcat } = await params;

  const category =
    await getCategoryById(idcat);

  if (!category) {
    notFound();
  }

  const products =
    await getProductsByCategory(
      category._id
    );

  const categorySymbol =
    category.icon ||
    category.name
      ?.charAt(0)
      .toUpperCase() ||
    "C";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          className="inline-flex items-center font-semibold text-blue-700 transition hover:-translate-x-1 hover:text-orange-600"
          href="/categories"
        >
          ← Volver a categorías
        </Link>

        <section className="mt-7 rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-4xl font-bold text-blue-700">
              {categorySymbol}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
                Categoría
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
                {category.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                {category.description ||
                  "Explorá los productos disponibles dentro de esta categoría."}
              </p>
            </div>
          </div>

          <div className="mt-7 inline-flex rounded-2xl bg-blue-50 px-5 py-3">
            <p className="text-sm font-semibold text-blue-700">
              {products.length}{" "}
              {products.length === 1
                ? "producto disponible"
                : "productos disponibles"}
            </p>
          </div>
        </section>

        <section className="mt-10">
          {products.length > 0 ? (
            <ProductGrid
              products={products}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 p-10 text-center">
              <h2 className="text-2xl font-bold text-orange-700">
                Todavía no hay productos
              </h2>

              <p className="mt-3 text-slate-600">
                Cuando agregues productos a
                esta categoría aparecerán en
                esta sección.
              </p>

              <Link
                className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800"
                href="/"
              >
                Ver todo el catálogo
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}