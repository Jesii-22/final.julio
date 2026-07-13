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
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <ProductDetail product={product} />

      {relatedProducts.length > 0 ? (
        <section className="mt-20 border-t border-slate-200 pt-12">
          <div className="mb-7">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              También te puede interesar
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Productos relacionados
            </h2>
          </div>

          <ProductGrid products={relatedProducts} />
        </section>
      ) : null}
    </main>
  );
}