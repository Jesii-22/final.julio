"use client";

import Image from "next/image";
import Link from "next/link";

import { useGlobalContext } from "@/context/GlobalContext";

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
  }).format(Number(price) || 0);
}

export default function FavoritesPage() {
  const {
    favorites,
    removeFavorite,
    activeUser,
  } = useGlobalContext();

  if (favorites.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Tus favoritos
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Todavía no guardaste productos
          </h1>

          <p className="mt-4 text-slate-600">
            Marcá los objetos de Mutuo que más te gusten para
            encontrarlos fácilmente acá.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            href="/"
          >
            Explorar productos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Mutuo
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Tus favoritos
        </h1>

        <p className="mt-3 max-w-2xl text-slate-600">
          {activeUser
            ? `Estos son los productos favoritos de ${activeUser.name}.`
            : "Estos favoritos son temporales. Cuando inicies sesión los sincronizaremos con tu cuenta."}
        </p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((product) => (
          <article
            key={product._id}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <Link href={`/product/${product._id}`}>
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
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
                    Sin imagen
                  </div>
                )}
              </div>
            </Link>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <Link
                  className="text-xl font-semibold text-slate-950 hover:text-blue-700"
                  href={`/product/${product._id}`}
                >
                  {product.name}
                </Link>

                <p className="shrink-0 font-bold text-blue-700">
                  {formatPrice(product.price)}
                </p>
              </div>

              <p className="mt-3 line-clamp-3 text-sm text-slate-600">
                {product.description || "Sin descripción disponible."}
              </p>

              {product.customizations?.length ? (
                <div className="mt-4 rounded-xl bg-blue-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                    Personalizable
                  </p>

                  <div className="mt-2 space-y-1">
                    {product.customizations.map(
                      (customization, index) => (
                        <p
                          key={`${customization.name}-${index}`}
                          className="text-xs text-blue-900"
                        >
                          <span className="font-semibold">
                            {customization.name}:
                          </span>{" "}
                          {customization.options?.join(", ")}
                        </p>
                      )
                    )}
                  </div>
                </div>
              ) : null}

              <p
                className={`mt-4 text-sm font-medium ${
                  product.stock > 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {product.stock > 0
                  ? `Stock disponible: ${product.stock}`
                  : "Sin stock"}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="flex flex-1 items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                  href={`/product/${product._id}`}
                >
                  Ver producto
                </Link>

                <button
                  className="flex flex-1 items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                  type="button"
                  onClick={() => removeFavorite(product._id)}
                >
                  Quitar
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}