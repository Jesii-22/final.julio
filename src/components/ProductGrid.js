"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }
  ).format(Number(price) || 0);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .trim();
}

function getCategoryId(category) {
  if (
    typeof category === "string"
  ) {
    return category;
  }

  return category?._id || "";
}

function getCategoryName(category) {
  if (
    typeof category === "string"
  ) {
    return category;
  }

  return category?.name || "";
}

function getAvailableCategories(
  products
) {
  const categoriesById = new Map();

  for (const product of products) {
    for (const category of
      product.categories || []) {
      if (
        typeof category === "string" ||
        !category?._id
      ) {
        continue;
      }

      categoriesById.set(
        category._id,
        category.name
      );
    }
  }

  return Array.from(
    categoriesById.entries()
  )
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((categoryA, categoryB) =>
      categoryA.name.localeCompare(
        categoryB.name,
        "es"
      )
    );
}

export default function ProductGrid({
  products = [],
  showFilters = false,
}) {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  const [
    stockFilter,
    setStockFilter,
  ] = useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const availableCategories =
    getAvailableCategories(products);

  const normalizedSearch =
    normalizeText(searchTerm);

  const filteredProducts =
    products
      .filter((product) => {
        const searchableContent =
          normalizeText(
            [
              product.name,
              product.description,
              ...(product.categories || [])
                .map(getCategoryName),
            ].join(" ")
          );

        const matchesSearch =
          !normalizedSearch ||
          searchableContent.includes(
            normalizedSearch
          );

        const matchesCategory =
          !selectedCategory ||
          (
            product.categories || []
          ).some(
            (category) =>
              getCategoryId(category) ===
              selectedCategory
          );

        const numericStock =
          Number(product.stock) || 0;

        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "available" &&
            numericStock > 0) ||
          (stockFilter === "unavailable" &&
            numericStock <= 0);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStock
        );
      })
      .sort((productA, productB) => {
        if (sortBy === "price_asc") {
          return (
            Number(productA.price) -
            Number(productB.price)
          );
        }

        if (sortBy === "price_desc") {
          return (
            Number(productB.price) -
            Number(productA.price)
          );
        }

        if (sortBy === "name_asc") {
          return productA.name.localeCompare(
            productB.name,
            "es"
          );
        }

        return (
          new Date(
            productB.createdAt || 0
          ).getTime() -
          new Date(
            productA.createdAt || 0
          ).getTime()
        );
      });

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCategory !== "" ||
    stockFilter !== "all" ||
    sortBy !== "newest";

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("");
    setStockFilter("all");
    setSortBy("newest");
  }

  if (products.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center text-slate-600">
        Todavía no hay productos
        cargados.
      </p>
    );
  }

  return (
    <section>
      {showFilters ? (
        <div className="mb-8 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Catálogo
              </p>

              <h2 className="mt-2 text-2xl font-bold text-orange-600">
                Encontrá tu producto
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Buscá por nombre,
                descripción o categoría.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-3">
              <p className="text-sm font-semibold text-blue-800">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "producto encontrado"
                  : "productos encontrados"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Buscar
              </span>

              <input
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Ejemplo: lámpara"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Categoría
              </span>

              <select
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Todas las categorías
                </option>

                {availableCategories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Disponibilidad
              </span>

              <select
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(
                    event.target.value
                  )
                }
              >
                <option value="all">
                  Todos
                </option>

                <option value="available">
                  Con stock
                </option>

                <option value="unavailable">
                  Sin stock
                </option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Ordenar
              </span>

              <select
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
              >
                <option value="newest">
                  Más recientes
                </option>

                <option value="price_asc">
                  Menor precio
                </option>

                <option value="price_desc">
                  Mayor precio
                </option>

                <option value="name_asc">
                  Nombre A–Z
                </option>
              </select>
            </label>
          </div>

          {hasActiveFilters ? (
            <div className="mt-5 flex justify-end">
              <button
                className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50"
                type="button"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/50 p-10 text-center">
          <p className="text-lg font-bold text-orange-700">
            No encontramos productos
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Probá utilizando otra búsqueda
            o modificando los filtros.
          </p>

          {hasActiveFilters ? (
            <button
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              type="button"
              onClick={clearFilters}
            >
              Ver todos los productos
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(
            (product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <Link
                  className="text-3xl font-bold text-orange-600 transition hover:text-blue-700 sm:text-2xl"
                  href={`/product/${product._id}`}
                >
                  <div className="relative aspect-4/3 bg-slate-100">
                    {product.image ? (
                      <Image
                        alt={product.name}
                        className="object-cover transition duration-300 hover:scale-[1.03]"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        src={getProductImageSrc(
                          product.image
                        )}
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
                      className="text-lg font-bold text-slate-950 transition hover:text-orange-600"
                      href={`/product/${product._id}`}
                    >
                      {product.name}
                    </Link>

                    <p className="shrink-0 text-base font-bold text-blue-700">
                      {formatPrice(
                        product.price
                      )}
                    </p>
                  </div>

                  <ProductPaymentInfo
                    price={product.price}
                    compact
                  />

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {product.description ||
                      "Sin descripción"}
                  </p>

                  {product.categories
                    ?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {product.categories.map(
                        (category) =>
                          typeof category ===
                          "string" ? (
                            <span
                              key={category}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {category}
                            </span>
                          ) : (
                            <Link
                              key={
                                category._id
                              }
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-orange-50 hover:text-orange-700"
                              href={`/category/${category._id}`}
                            >
                              {
                                category.name
                              }
                            </Link>
                          )
                      )}
                    </div>
                  ) : null}

                  {product.customizations
                    ?.length ? (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                        Personalizable
                      </p>

                      <div className="mt-2 space-y-1">
                        {product.customizations.map(
                          (
                            customization,
                            index
                          ) => (
                            <p
                              key={`${customization.name}-${index}`}
                              className="text-xs text-blue-900"
                            >
                              <span className="font-semibold">
                                {
                                  customization.name
                                }
                                :
                              </span>{" "}
                              {customization.options?.join(
                                ", "
                              )}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p
                      className={`text-sm font-semibold ${
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
                      className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800"
                      href={`/product/${product._id}`}
                    >
                      Ver producto
                    </Link>
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}