import Image from "next/image";
import Link from "next/link";

function getProductImageSrc(image) {
  if (!image) {
    return "";
  }

  if (image.startsWith("/")) {
    return image;
  }

  return `/images/products/${image}`;
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        Todavía no hay productos cargados.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product._id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <Link
            className="block"
            href={`/product/${product._id}`}
          >
            <div className="relative aspect-4/3 bg-slate-100">
              {product.image ? (
                <Image
                  alt={product.name}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={getProductImageSrc(product.image)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  Sin imagen
                </div>
              )}
            </div>
          </Link>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <Link
                className="text-lg font-semibold text-slate-950 hover:text-blue-700"
                href={`/product/${product._id}`}
              >
                {product.name}
              </Link>

              <p className="shrink-0 text-base font-semibold text-blue-700">
                {formatPrice(product.price)}
              </p>
            </div>

            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
              {product.description || "Sin descripción"}
            </p>

            {product.categories?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.categories.map((category) =>
                  typeof category === "string" ? (
                    <span
                      key={category}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {category}
                    </span>
                  ) : (
                    <Link
                      key={category._id}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      href={`/category/${category._id}`}
                    >
                      {category.name}
                    </Link>
                  )
                )}
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-4">
              <p
                className={`text-sm font-medium ${
                  product.stock > 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {product.stock > 0
                  ? `Stock: ${product.stock}`
                  : "Sin stock"}
              </p>

              <Link
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                href={`/product/${product._id}`}
              >
                Ver producto
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}