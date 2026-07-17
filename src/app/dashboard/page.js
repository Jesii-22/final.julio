import Link from "next/link";

import DashboardSummary from "@/components/DashboardSummary";
import ProductDashboardContainer from "@/containers/ProductDashboardContainer";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    title: "Administrar órdenes",
    description:
      "Revisá las compras, medios de pago, entregas y estados de cada pedido.",
    href: "/dashboard/orders",
    buttonText: "Ver órdenes",
  },
  {
    title: "Ver la tienda",
    description:
      "Ingresá al ecommerce como cliente para revisar productos y navegación.",
    href: "/",
    buttonText: "Ir a la tienda",
  },
  {
    title: "Mi cuenta",
    description:
      "Consultá los datos de tu perfil y el historial de compras realizadas.",
    href: "/user",
    buttonText: "Ver mi cuenta",
  },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      {/* SECCIÓN PRINCIPAL: Fondo azul marino profundo, elegante y sin cansar la vista */}
      <section className="overflow-hidden rounded-3xl bg-blue-900/80 backdrop-blur-md border border-blue-800/50 px-6 py-10 text-white shadow-2xl sm:px-10 sm:py-12">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
              Administración de Mutuo
            </p>

            {/* Título en Naranja */}
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-400 sm:text-5xl">
              Gestioná tu ecommerce desde un solo lugar
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100">
              Administrá el catálogo, las categorías, el stock y las órdenes de
              compra de los productos de Mutuo.
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 justify-center rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600 hover:shadow-lg"
            href="/dashboard/orders"
          >
            Administrar órdenes
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 hover:border-white/20">
            <p className="text-sm text-blue-200">Catálogo</p>
            <p className="mt-2 text-lg font-semibold text-orange-300">
              Productos y categorías
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 hover:border-white/20">
            <p className="text-sm text-blue-200">Inventario</p>
            <p className="mt-2 text-lg font-semibold text-orange-300">
              Control de stock
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 hover:border-white/20">
            <p className="text-sm text-blue-200">Ventas</p>
            <p className="mt-2 text-lg font-semibold text-orange-300">
              Pedidos y entregas
            </p>
          </div>
        </div>
      </section>

            <DashboardSummary />

      {/* SECCIÓN ACCESOS RÁPIDOS */}
      <section className="mt-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Accesos rápidos
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            ¿Qué querés administrar?
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {quickActions.map((action) => (
            <article
              key={action.href}
              className="flex flex-col rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-orange-200"
            >
              <h3 className="text-xl font-bold text-orange-600">
                {action.title}
              </h3>

              <p className="mt-3 flex-1 leading-6 text-slate-600">
                {action.description}
              </p>

              <Link
                className="mt-6 inline-flex justify-center rounded-xl border border-blue-300 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                href={action.href}
              >
                {action.buttonText}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* SECCIÓN CATÁLOGO */}
      <section className="mt-12">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Gestión del catálogo
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            Productos y categorías
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Creá, editá o eliminá productos, actualizá el stock y organizá el
            catálogo de la tienda.
          </p>
        </div>

        <ProductDashboardContainer />
      </section>
    </main>
  );
}