import Link from "next/link";

import ProductDashboardContainer from "@/containers/ProductDashboardContainer";

export const dynamic = "force-dynamic";

export default function DashboardProductsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <Link
        className="inline-flex items-center font-semibold text-blue-700 transition hover:-translate-x-1 hover:text-blue-900"
        href="/dashboard"
      >
        ← Volver al dashboard
      </Link>

      <section className="mt-6 overflow-hidden rounded-3xl border border-blue-800/50 bg-blue-900/80 px-6 py-10 text-white shadow-2xl backdrop-blur-md sm:px-10 sm:py-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
              Gestión del catálogo
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-400 sm:text-5xl">
              Productos y categorías
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
              Creá y editá los productos de Mutuo, organizá
              las categorías y mantené actualizado el stock
              disponible de la tienda.
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 justify-center rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
            href="/"
          >
            Ver tienda
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
            <p className="text-sm text-blue-200">
              Productos
            </p>

            <p className="mt-2 text-lg font-semibold text-orange-300">
              Crear y editar
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
            <p className="text-sm text-blue-200">
              Categorías
            </p>

            <p className="mt-2 text-lg font-semibold text-orange-300">
              Organizar el catálogo
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
            <p className="text-sm text-blue-200">
              Inventario
            </p>

            <p className="mt-2 text-lg font-semibold text-orange-300">
              Actualizar el stock
            </p>
          </article>
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
            Desde esta sección podés crear, editar o eliminar
            productos y categorías, configurar opciones de
            personalización y controlar las unidades disponibles.
          </p>
        </div>

        <ProductDashboardContainer />
      </section>
    </main>
  );
}