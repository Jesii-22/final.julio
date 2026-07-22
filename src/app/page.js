import Link from "next/link";

import HomeHero from "@/components/HomeHero";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  const categoriesById = new Map();

  for (const product of products) {
    for (const category of product.categories || []) {
      if (
        typeof category === "object" &&
        category?._id
      ) {
        categoriesById.set(
          category._id,
          category
        );
      }
    }
  }

  const featuredCategories = Array.from(
    categoriesById.values()
  ).slice(0, 3);

  const featuredProducts = products.slice(
    0,
    3
  );

  return (
    <>
      <HomeHero />

      <main
        className="bg-slate-50 text-slate-900"
        id="catalogo"
      >
        {/* Categorías principales */}
          <section className="px-5 py-14 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                    Explorá Mutuo
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-orange-600 sm:text-4xl">
                    Objetos para cada espacio
                  </h2>

                  <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                    Encontrá soluciones funcionales para organizar, decorar y
                    simplificar tu hogar.
                  </p>
                </div>

                <Link
                  className="self-start font-semibold text-blue-700 transition hover:text-orange-600 sm:self-auto"
                  href="/categories"
                >
                  Ver todas las categorías →
                </Link>
              </div>

              <div className="mt-9 grid gap-5 md:grid-cols-3">
                {featuredCategories.map(
                  (category, index) => (
                    <Link
                      key={category._id}
                      className="group relative min-h-56 overflow-hidden rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg active:scale-[0.98]"
                      href={`/category/${category._id}`}
                    >
                      <div className="mutuo-category-bubble absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 transition duration-300 group-hover:scale-125 group-hover:bg-orange-50" />

                      <div className="relative">
                        <div
                          className="mutuo-category-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl transition group-hover:bg-orange-50"
                          style={{
                            animationDelay: `${index * 0.35}s`,
                          }}
                        >
                          {category.emoji ||
                            category.icon ||
                            ["⌂", "✦", "◉"][index]}
                        </div>

                        <h3 className="mt-8 text-2xl font-bold text-slate-950 transition group-hover:text-orange-600">
                          {category.name}
                        </h3>

                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                          {category.description ||
                            "Descubrí los objetos de esta categoría."}
                        </p>

                        <p className="mt-6 text-sm font-semibold text-blue-700 transition group-hover:text-orange-600">
                          Explorar categoría →
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </section>

        {/* Productos destacados */}
        <section className="border-y border-blue-100 bg-white px-5 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                  Selección Mutuo
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-orange-600 sm:text-4xl">
                  Elegidos para tu día a día
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  Una selección de objetos impresos
                  en 3D, pensados para acompañar
                  espacios reales.
                </p>
              </div>

              <Link
                className="self-start rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md active:scale-[0.98] sm:self-auto"
                href="/products"
              >
                Ver todos los productos
              </Link>
            </div>

            <div className="mt-9">
              <ProductGrid
                products={featuredProducts}
              />
            </div>
          </div>
        </section>

        {/* Presentación de marca */}
       
        <section className="px-5 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-blue-950 shadow-lg lg:grid-cols-2">
            <div className="group relative flex min-h-80 items-center justify-center overflow-hidden p-10">
              {/* Luz suave de fondo */}
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/20 blur-3xl" />

              <div className="relative flex h-64 w-64 items-center justify-center transition duration-500 group-hover:scale-[1.03]">
                {/* Círculo exterior */}
                <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-blue-500/50">
                  <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_22px_rgba(251,146,60,0.75)]" />
                </div>

                {/* Segundo círculo */}
                <div className="absolute inset-5 animate-[spin_14s_linear_infinite_reverse] rounded-full border border-blue-400/40">
                  <span className="absolute bottom-3 right-5 h-2 w-2 rounded-full bg-blue-300" />
                </div>

                {/* Centro */}
                <div className="absolute inset-11 animate-[pulse_4s_ease-in-out_infinite] rounded-full border border-orange-400/30 bg-blue-900/90 shadow-2xl" />

                {/* Logo */}
                <div className="relative text-center">
                  <p className="text-5xl font-bold tracking-tight text-white">
                    mutuo
                    <span className="text-orange-400">
                      .
                    </span>
                  </p>

                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-blue-200">
                    Objetos funcionales
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-400">
                Sobre nosotros
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Simplicidad que mejora la experiencia del hogar
              </h2>

              <p className="mt-5 leading-7 text-blue-100">
                En Mutuo diseñamos objetos funcionales impresos en 3D,
                buscando combinar orden, practicidad y una estética simple.
                Cada pieza nace para resolver una necesidad cotidiana sin dejar
                de formar parte de tu espacio.
              </p>

              <Link
                className="mt-8 self-start rounded-xl border border-orange-400 px-5 py-3 text-sm font-semibold text-orange-300 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-500 hover:text-white active:scale-[0.98]"
                href="/products"
              >
                Conocer nuestros objetos
              </Link>
            </div>
          </div>
        </section>


        {/* Cierre */}
        <section className="px-5 pb-16 sm:px-6 sm:pb-24">
          <div className="mx-auto flex max-w-6xl flex-col items-center rounded-3xl border border-orange-200 bg-orange-50 px-6 py-12 text-center sm:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-700">
              Diseñado para lo cotidiano
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Una forma más simple de habitar
              tus espacios
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-600">
              Explorá la colección y elegí el
              objeto que mejor se adapte a tu
              hogar.
            </p>

            <Link
              className="mt-7 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
              href="/products"
            >
              Ir a la tienda
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}