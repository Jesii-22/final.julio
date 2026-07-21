import Link from "next/link";

import DashboardSummary from "@/components/DashboardSummary";

export const dynamic = "force-dynamic";

const quickActions = [
  {
    title: "Productos y categorías",
    description:
      "Creá productos, actualizá precios, administrá categorías y controlá el stock.",
    href: "/dashboard/products",
    buttonText: "Gestionar catálogo",
  },
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
      "Ingresá al ecommerce como cliente para revisar los productos y la navegación.",
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

const dashboardAreas = [
  {
    eyebrow: "Catálogo",
    title: "Productos y categorías",
    description:
      "Administración de artículos, precios y opciones personalizables.",
  },
  {
    eyebrow: "Inventario",
    title: "Control de stock",
    description:
      "Seguimiento de las unidades disponibles de cada producto.",
  },
  {
    eyebrow: "Ventas",
    title: "Pedidos y entregas",
    description:
      "Control de órdenes, pagos, envíos y puntos de retiro.",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white px-6 py-10 shadow-lg shadow-blue-950/5 sm:px-10 sm:py-12">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Administración de Mutuo
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
              Gestioná tu ecommerce desde un solo lugar
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Administrá el catálogo, las categorías, el stock y las órdenes
              de compra de los productos de Mutuo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-xl border border-blue-300 bg-white px-6 py-4 font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                href="/dashboard/products"
              >
                Gestionar catálogo
              </Link>

              <Link
                className="inline-flex justify-center rounded-xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md"
                href="/dashboard/orders"
              >
                Administrar órdenes
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {dashboardAreas.map((area) => (
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

        <DashboardSummary />

        <section className="mt-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Accesos rápidos
            </p>

            <h2 className="mt-2 text-3xl font-bold text-orange-600">
              ¿Qué querés administrar?
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Accedé rápidamente a las principales secciones de administración
              y control de Mutuo.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <article
                key={action.href}
                className="flex flex-col rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <h3 className="text-xl font-bold text-orange-600">
                  {action.title}
                </h3>

                <p className="mt-3 flex-1 leading-6 text-slate-600">
                  {action.description}
                </p>

                <Link
                  className="mt-6 inline-flex justify-center rounded-xl border border-blue-300 px-5 py-3 font-semibold text-blue-700 transition hover:bg-orange-50 hover:text-orange-700"
                  href={action.href}
                >
                  {action.buttonText}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}