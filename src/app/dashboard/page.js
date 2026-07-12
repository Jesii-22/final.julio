import ProductDashboardContainer from "@/containers/ProductDashboardContainer";

export const dynamic = "force-dynamic";

const endpoints = [
  "GET /api/products",
  "POST /api/products",
  "GET /api/products/:id",
  "PUT /api/products/:id",
  "DELETE /api/products/:id",
  "GET /api/categories",
  "POST /api/categories",
  "GET /api/categories/:id",
  "PUT /api/categories/:id",
  "DELETE /api/categories/:id",
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg bg-slate-900 px-8 py-10 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Programacion 3
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold">
            Dashboard de ecommerce
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Administracion de productos y categorias con Next.js, Route
            Handlers y MongoDB.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {endpoints.map((endpoint) => (
              <span
                key={endpoint}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm"
              >
                {endpoint}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <ProductDashboardContainer />
        </section>
      </div>
    </main>
  );
}
