"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useGlobalContext } from "@/context/GlobalContext";
import ProductPaymentInfo from "@/components/ProductPaymentInfo";


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

export default function ProductDetail({ product }) {
  const {
    addToCart,
    toggleFavorite,
    isFavorite,
  } = useGlobalContext();

  const [quantity, setQuantity] = useState(1);

  const [selectedCustomizations, setSelectedCustomizations] =
    useState(() =>
      Object.fromEntries(
        (product.customizations || []).map((customization) => [
          customization.name,
          "",
        ])
      )
    );

  const [message, setMessage] = useState("");

  const favorite = isFavorite(product._id);
  const hasStock = product.stock > 0;

  const allCustomizationsSelected = (
    product.customizations || []
  ).every(
    (customization) =>
      selectedCustomizations[customization.name]
  );

  function handleCustomizationChange(name, value) {
    setSelectedCustomizations((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function handleQuantityChange(event) {
    const value = Number(event.target.value);

    const safeQuantity = Math.max(
      1,
      Math.min(value || 1, product.stock)
    );

    setQuantity(safeQuantity);
  }

  function handleAddToCart() {
    if (!hasStock) {
      setMessage("Este producto no tiene stock disponible.");
      return;
    }

    if (!allCustomizationsSelected) {
      setMessage(
        "Seleccioná todas las opciones antes de agregar el producto."
      );
      return;
    }

    addToCart(
      product,
      selectedCustomizations,
      quantity
    );

    setMessage(
      `${quantity} ${
        quantity === 1 ? "producto agregado" : "productos agregados"
      } al carrito.`
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
        <div className="relative aspect-square">
          {product.image ? (
            <Image
              alt={product.name}
              className="object-cover"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={getProductImageSrc(product.image)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
              Este producto todavía no tiene imagen.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {product.categories?.length ? (
          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <Link
                key={
                  typeof category === "string"
                    ? category
                    : category._id
                }
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                href={
                  typeof category === "string"
                    ? "/categories"
                    : `/category/${category._id}`
                }
              >
                {typeof category === "string"
                  ? category
                  : category.name}
              </Link>
            ))}
          </div>
        ) : null}

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          {product.name}
        </h1>

        <p className="mt-4 text-3xl font-semibold text-blue-700">
          {formatPrice(product.price)}
        </p>

          <ProductPaymentInfo price={product.price} />

        <p className="mt-6 leading-7 text-slate-600">
          {product.description || "Sin descripción disponible."}
        </p>

        <div className="mt-6">
          {hasStock ? (
            <p className="text-sm font-medium text-emerald-700">
              Stock disponible: {product.stock}
            </p>
          ) : (
            <p className="text-sm font-medium text-red-700">
              Producto sin stock
            </p>
          )}
        </div>

        {product.customizations?.length ? (
          <div className="mt-8 space-y-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Personalizá tu producto
            </h2>

            {product.customizations.map((customization) => (
              <label
                key={customization.name}
                className="block"
              >
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  {customization.name}
                </span>

                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600"
                  value={
                    selectedCustomizations[
                      customization.name
                    ] || ""
                  }
                  onChange={(event) =>
                    handleCustomizationChange(
                      customization.name,
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Seleccionar {customization.name.toLowerCase()}
                  </option>

                  {customization.options.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            Este producto no requiere personalización.
          </p>
        )}

        <div className="mt-8">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Cantidad
            </span>

            <input
              className="w-28 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              disabled={!hasStock}
              max={product.stock}
              min="1"
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-xl bg-blue-700 px-6 py-4 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!hasStock}
            type="button"
            onClick={handleAddToCart}
          >
            {hasStock
              ? "Agregar al carrito"
              : "Sin stock"}
          </button>

          <button
            className={`rounded-xl border px-6 py-4 font-semibold transition ${
              favorite
                ? "border-orange-300 bg-orange-50 text-orange-700"
                : "border-slate-300 text-slate-700 hover:bg-slate-100"
            }`}
            type="button"
            onClick={() => toggleFavorite(product)}
          >
            {favorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"}
          </button>
        </div>

        {message ? (
          <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm font-medium text-blue-800">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}