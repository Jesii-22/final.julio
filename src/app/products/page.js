import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Productos | Mutuo",
  description:
    "Explorá los objetos funcionales impresos en 3D de Mutuo.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <section className="mb-10 border-b border-blue-100 pb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                Tienda Mutuo
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
                Todos los productos
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Descubrí objetos funcionales impresos en 3D para organizar,
                decorar y simplificar los espacios de todos los días.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                Impresión 3D
                </span>

                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                Diseño funcional
                </span>

                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Productos personalizables
                </span>
            </div>
            </section>

        <ProductGrid
          products={products}
          showFilters
        />
      </div>
    </main>
  );
}