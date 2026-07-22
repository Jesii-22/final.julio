"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import ActionToast from "@/components/ActionToast";
import ProductPaymentInfo from "@/components/ProductPaymentInfo";
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

export default function ProductDetail({ product }) {
  const {
    addToCart,
    toggleFavorite,
    isFavorite,
  } = useGlobalContext();

  const [quantity, setQuantity] =
    useState(1);

  const [
    selectedCustomizations,
    setSelectedCustomizations,
  ] = useState(() =>
    Object.fromEntries(
      (product.customizations || []).map(
        (customization) => [
          customization.name,
          "",
        ]
      )
    )
  );

  const [toast, setToast] = useState({
    message: "",
    type: "success",
  });

  const [
    isToastVisible,
    setIsToastVisible,
  ] = useState(false);

  const [isAdded, setIsAdded] =
    useState(false);

  const toastTimeoutRef = useRef(null);
  const toastFrameRef = useRef(null);
  const addedTimeoutRef = useRef(null);

  const favorite = isFavorite(product._id);
  const hasStock = product.stock > 0;

  const allCustomizationsSelected = (
    product.customizations || []
  ).every(
    (customization) =>
      selectedCustomizations[
        customization.name
      ]
  );

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(
          toastTimeoutRef.current
        );
      }

      if (addedTimeoutRef.current) {
        window.clearTimeout(
          addedTimeoutRef.current
        );
      }

      if (toastFrameRef.current) {
        window.cancelAnimationFrame(
          toastFrameRef.current
        );
      }
    };
  }, []);

  function showToast(
    message,
    type = "success"
  ) {
    if (toastTimeoutRef.current) {
      window.clearTimeout(
        toastTimeoutRef.current
      );
    }

    if (toastFrameRef.current) {
      window.cancelAnimationFrame(
        toastFrameRef.current
      );
    }

    setToast({
      message,
      type,
    });

    setIsToastVisible(false);

    toastFrameRef.current =
      window.requestAnimationFrame(() => {
        setIsToastVisible(true);
      });

    toastTimeoutRef.current =
      window.setTimeout(() => {
        setIsToastVisible(false);
      }, 2600);
  }

  function handleCustomizationChange(
    name,
    value
  ) {
    setSelectedCustomizations(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  function handleQuantityChange(event) {
    const value = Number(
      event.target.value
    );

    const safeQuantity = Math.max(
      1,
      Math.min(
        value || 1,
        product.stock
      )
    );

    setQuantity(safeQuantity);
  }

  function handleAddToCart() {
    if (!hasStock) {
      showToast(
        "Este producto no tiene stock disponible.",
        "error"
      );

      return;
    }

    if (!allCustomizationsSelected) {
      showToast(
        "Seleccioná todas las opciones antes de agregar el producto.",
        "error"
      );

      return;
    }

    addToCart(
      product,
      selectedCustomizations,
      quantity
    );

    setIsAdded(true);

    showToast(
      `${quantity} ${
        quantity === 1
          ? "producto agregado"
          : "productos agregados"
      } al carrito.`,
      "success"
    );

    if (addedTimeoutRef.current) {
      window.clearTimeout(
        addedTimeoutRef.current
      );
    }

    addedTimeoutRef.current =
      window.setTimeout(() => {
        setIsAdded(false);
      }, 1600);
  }

  function handleToggleFavorite() {
    toggleFavorite(product);

    showToast(
      favorite
        ? "Producto quitado de favoritos."
        : "Producto guardado en favoritos.",
      favorite ? "info" : "success"
    );
  }

  return (
    <>
      <ActionToast
        message={toast.message}
        type={toast.type}
        visible={isToastVisible}
      />

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
                src={getProductImageSrc(
                  product.image
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-slate-500">
                Este producto todavía no
                tiene imagen.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {product.categories?.length ? (
            <div className="flex flex-wrap gap-2">
              {product.categories.map(
                (category) => (
                  <Link
                    key={
                      typeof category ===
                      "string"
                        ? category
                        : category._id
                    }
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-orange-50 hover:text-orange-700"
                    href={
                      typeof category ===
                      "string"
                        ? "/categories"
                        : `/category/${category._id}`
                    }
                  >
                    {typeof category ===
                    "string"
                      ? category
                      : category.name}
                  </Link>
                )
              )}
            </div>
          ) : null}

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font-semibold text-blue-700">
            {formatPrice(product.price)}
          </p>

          <ProductPaymentInfo
            price={product.price}
          />

          <p className="mt-6 leading-7 text-slate-600">
            {product.description ||
              "Sin descripción disponible."}
          </p>

          <div className="mt-6">
            {hasStock ? (
              <p className="text-sm font-medium text-emerald-700">
                Stock disponible:{" "}
                {product.stock}
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

              {product.customizations.map(
                (customization) => (
                  <label
                    key={customization.name}
                    className="block"
                  >
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      {customization.name}
                    </span>

                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                        Seleccionar{" "}
                        {customization.name.toLowerCase()}
                      </option>

                      {customization.options.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                )
              )}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
              Este producto no requiere
              personalización.
            </p>
          )}

          <div className="mt-8">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Cantidad
              </span>

              <input
                className="w-28 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={!hasStock}
                max={product.stock}
                min="1"
                type="number"
                value={quantity}
                onChange={
                  handleQuantityChange
                }
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className={`rounded-xl px-6 py-4 font-semibold text-white shadow-sm transition duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none ${
                isAdded
                  ? "bg-emerald-600 shadow-emerald-900/10"
                  : "bg-blue-700 hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md"
              }`}
              disabled={!hasStock}
              type="button"
              onClick={handleAddToCart}
            >
              {!hasStock
                ? "Sin stock"
                : isAdded
                  ? "✓ Agregado"
                  : "Agregar al carrito"}
            </button>

            <button
              className={`rounded-xl border px-6 py-4 font-semibold transition duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
                favorite
                  ? "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              }`}
              type="button"
              onClick={
                handleToggleFavorite
              }
            >
              {favorite
                ? "Quitar de favoritos"
                : "Agregar a favoritos"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}