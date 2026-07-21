import CommerceBenefitsBar from "@/components/CommerceBenefitsBar";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <CommerceBenefitsBar />

        <section className="mb-8 mt-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
            Objetos funcionales para el hogar
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
            Productos de Mutuo
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Explorá nuestros objetos impresos en 3D,
            encontrá el producto que necesitás y
            personalizalo según las opciones disponibles.
          </p>
        </section>

        <ProductGrid
          products={products}
          showFilters
        />
      </div>
    </main>
  );
}