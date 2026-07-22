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

export default function CartPage() {
  const {
    cart,
    cartTotal,
    changeCartQuantity,
    removeFromCart,
    clearCart,
  } = useGlobalContext();

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Tu carrito
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Todavía no agregaste productos
          </h1>

          <p className="mt-4 text-slate-600">
            Explorá los productos de Mutuo, elegí sus
            customizaciones y agregalos al carrito.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            href="/"
          >
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Mutuo
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Tu carrito
          </h1>

          <p className="mt-3 text-slate-600">
            Revisá los productos y sus personalizaciones antes de
            continuar.
          </p>
        </div>

        <button
          className="self-start rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm active:scale-[0.97]"
          type="button"
          onClick={clearCart}
        >
          Vaciar carrito
        </button>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          {cart.map((item) => (
            <article
              key={item.itemKey}
              className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-md sm:grid-cols-[140px_1fr]"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                {item.image ? (
                  <Image
                    alt={item.name}
                    className="object-cover"
                    fill
                    sizes="140px"
                    src={getProductImageSrc(item.image)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-slate-500">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      className="text-xl font-semibold text-slate-950 hover:text-blue-700"
                      href={`/product/${item.productId}`}
                    >
                      {item.name}
                    </Link>

                    <p className="mt-1 text-sm text-slate-500">
                      Precio unitario: {formatPrice(item.price)}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-blue-700">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>

                {Object.keys(item.customizations || {}).length > 0 ? (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-950">
                      Personalizaciones
                    </p>

                    <div className="mt-2 space-y-1">
                      {Object.entries(item.customizations).map(
                        ([name, value]) => (
                          <p
                            key={name}
                            className="text-sm text-blue-900"
                          >
                            <span className="font-medium">{name}:</span>{" "}
                            {value}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-300">
                    <button
                      className="h-11 w-11 text-lg font-semibold text-slate-700 transition duration-150 hover:bg-blue-50 hover:text-blue-700 active:scale-90"
                      aria-label={`Disminuir cantidad de ${item.name}`}
                      type="button"
                      onClick={() =>
                        changeCartQuantity(
                          item.itemKey,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <span className="flex h-11 min-w-12 items-center justify-center border-x border-slate-300 px-3 font-semibold text-slate-900">
                      {item.quantity}
                    </span>

                    <button
                      className="h-11 w-11 text-lg font-semibold text-slate-700 hover:bg-slate-100"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      type="button"
                      onClick={() =>
                        changeCartQuantity(
                          item.itemKey,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 transition duration-200 hover:bg-red-50 hover:text-red-900 active:scale-[0.96]"
                    type="button"
                    onClick={() => removeFromCart(item.itemKey)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold text-slate-950">
            Resumen
          </h2>

          <div className="mt-6 space-y-4 border-b border-slate-200 pb-6">
            {cart.map((item) => (
              <div
                key={item.itemKey}
                className="flex justify-between gap-4 text-sm"
              >
                <p className="text-slate-600">
                  {item.name} × {item.quantity}
                </p>

                <p className="shrink-0 font-medium text-slate-900">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-lg font-semibold text-slate-950">
              Total
            </p>

            <p className="text-2xl font-bold text-blue-700">
              {formatPrice(cartTotal)}
            </p>
          </div>

          <Link
            className="mt-7 flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md active:scale-[0.98]"
            href="/checkout"
          >
            Continuar al checkout
          </Link>

          <Link
            className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 active:scale-[0.98]"            href="/"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </main>
  );
}