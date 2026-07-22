import Link from "next/link";

import ProductDashboardContainer from "@/containers/ProductDashboardContainer";

export const dynamic = "force-dynamic";

const catalogAreas = [
  {
    eyebrow: "Productos",
    title: "Crear y editar",
    description:
      "Administrá nombres, imágenes, precios, descripciones y personalizaciones.",
  },
  {
    eyebrow: "Categorías",
    title: "Organizar el catálogo",
    description:
      "Creá rubros, agregá íconos y asociá cada producto a sus categorías.",
  },
  {
    eyebrow: "Inventario",
    title: "Actualizar el stock",
    description:
      "Controlá las unidades disponibles y detectá rápidamente el stock bajo.",
  },
];

export default function DashboardProductsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          className="inline-flex items-center font-semibold text-blue-700 transition hover:-translate-x-1 hover:text-orange-600"
          href="/dashboard"
        >
          ← Volver al dashboard
        </Link>

        <section className="mt-7 overflow-hidden rounded-3xl border border-blue-100 bg-white px-6 py-10 shadow-lg shadow-blue-950/5 sm:px-10 sm:py-12">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Gestión del catálogo
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
              Productos y categorías
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Creá y editá los productos de Mutuo, organizá las categorías y
              mantené actualizado el stock disponible de la tienda.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-xl bg-blue-700 px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md"
                href="/"
              >
                Ver tienda
              </Link>

              <Link
                className="inline-flex justify-center rounded-xl border border-blue-300 bg-white px-6 py-4 font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                href="/categories"
              >
                Ver categorías
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {catalogAreas.map((area) => (
              <article
                key={area.title}
                className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-50/40 hover:shadow-sm"
              >
                <p className="text-sm font-semibold text-blue-700">
                  {area.eyebrow}
                </p>

                <p className="mt-2 text-lg font-bold text-orange-600">
                  {area.title}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {area.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Administración
            </p>

            <h2 className="mt-2 text-3xl font-bold text-orange-600">
              Catálogo de Mutuo
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              Desde esta sección podés crear, editar o eliminar productos y
              categorías, configurar opciones de personalización y controlar
              las unidades disponibles.
            </p>
          </div>

          <ProductDashboardContainer />
        </section>
      </div>
    </main>
  );
}