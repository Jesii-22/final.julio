import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetail from "@/components/ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import {
  getProductById,
  getRelatedProducts,
} from "@/lib/products";

export default async function ProductPage({ params }) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const categoryIds = (product.categories || []).map((category) =>
    typeof category === "string" ? category : category._id
  );

  const relatedProducts = await getRelatedProducts(
    product._id,
    categoryIds,
    3
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-7xl">
        <Link
          className="mb-7 inline-flex items-center font-semibold text-blue-700 transition hover:-translate-x-1 hover:text-orange-600"
          href="/"
        >
          ← Volver a la tienda
        </Link>

        <ProductDetail product={product} />

        {relatedProducts.length > 0 ? (
          <section className="mt-20 border-t border-blue-100 pt-12">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                También te puede interesar
              </p>

              <h2 className="mt-2 text-3xl font-bold text-orange-600">
                Productos relacionados
              </h2>
            </div>

            <ProductGrid products={relatedProducts} />
          </section>
        ) : null}
      </div>
    </main>
  );
}