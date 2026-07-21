import Link from "next/link";

import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories =
    await getCategories();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600">
            Categorías
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-blue-700 sm:text-5xl">
            Rubros del ecommerce
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Explorá los productos de Mutuo
            organizados según su categoría.
          </p>
        </section>

        {categories.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center text-slate-600">
            Todavía no hay categorías
            cargadas.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(
              (category) => (
                <Link
                  key={category._id}
                  className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50/50 hover:shadow-lg"
                  href={`/category/${category._id}`}
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700 transition group-hover:bg-orange-100 group-hover:text-orange-700">
                    {category.name
                      ?.charAt(0)
                      .toUpperCase() || "C"}
                  </div>

                  <h2 className="text-xl font-bold text-blue-700 transition group-hover:text-orange-600">
                    {category.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {category.description ||
                      "Sin descripción"}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-blue-700 transition group-hover:translate-x-1 group-hover:text-orange-700">
                    Ver productos →
                  </p>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}