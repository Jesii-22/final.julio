"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/app/actions/products";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image: "",
  categories: [],
  customizations: [],
};

export default function ProductManager({
  initialCategories = [],
  initialProducts = [],
}) {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, startRefreshTransition] = useTransition();

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditingId("");
    setMessage("");
  }, []);

  const refreshProducts = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCategoryChange(event) {
    const { checked, value } = event.target;

    setForm((current) => {
      const categories = checked
        ? [...current.categories, value]
        : current.categories.filter(
            (categoryId) => categoryId !== value
          );

      return {
        ...current,
        categories,
      };
    });
  }

  function addCustomization() {
    setForm((current) => ({
      ...current,
      customizations: [
        ...current.customizations,
        {
          name: "",
          options: "",
        },
      ],
    }));
  }

  function updateCustomization(index, field, value) {
    setForm((current) => ({
      ...current,
      customizations: current.customizations.map(
        (customization, customizationIndex) =>
          customizationIndex === index
            ? {
                ...customization,
                [field]: value,
              }
            : customization
      ),
    }));
  }

  function removeCustomization(index) {
    setForm((current) => ({
      ...current,
      customizations: current.customizations.filter(
        (_, customizationIndex) => customizationIndex !== index
      ),
    }));
  }

  function getCustomizationsForSubmit() {
    return form.customizations
      .map((customization) => ({
        name: customization.name.trim(),
        options: customization.options
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
      }))
      .filter(
        (customization) =>
          customization.name &&
          customization.options.length > 0
      );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);

    const action = editingId
      ? updateProduct.bind(null, editingId)
      : createProduct;

    try {
      const result = await action(null, formData);

      setMessage(result.message);

      if (result.ok) {
        resetForm();
        refreshProducts();
      }
    } catch {
      setMessage("Ocurrió un error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(product) {
    setEditingId(product._id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image || "",

      categories: (product.categories || []).map((category) =>
        typeof category === "string"
          ? category
          : category._id
      ),

      customizations: (product.customizations || []).map(
        (customization) => ({
          name: customization.name || "",
          options: Array.isArray(customization.options)
            ? customization.options.join(", ")
            : "",
        })
      ),
    });

    setMessage("Editando producto.");
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar este producto?"
    );

    if (!confirmed) {
      return;
    }

    const result = await deleteProduct(id);

    if (!result.ok) {
      setMessage(
        result.message || "No se pudo eliminar el producto."
      );

      return;
    }

    if (editingId === id) {
      resetForm();
    }

    setMessage(result.message);
    refreshProducts();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          {editingId ? "Editar producto" : "Nuevo producto"}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Cargá los productos de Mutuo y sus opciones de
          personalización.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
            name="name"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
            name="description"
            placeholder="Descripción"
            value={form.description}
            onChange={handleChange}
          />

          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
            name="price"
            placeholder="Precio"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />

          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
            name="stock"
            placeholder="Stock"
            type="number"
            min="0"
            value={form.stock}
            onChange={handleChange}
            required
          />

          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-600"
            name="image"
            placeholder="Ejemplo: posa-cuchara.webp"
            value={form.image}
            onChange={handleChange}
          />

          <p className="text-xs text-slate-500">
            La imagen debe estar guardada en
            public/images/products/.
          </p>

          <fieldset className="rounded-lg border border-slate-300 px-4 py-3">
            <legend className="px-1 text-sm font-medium text-slate-700">
              Categorías
            </legend>

            {initialCategories.length === 0 ? (
              <p className="py-2 text-sm text-slate-500">
                Creá una categoría antes de asociarla a productos.
              </p>
            ) : (
              <div className="grid gap-3">
                {initialCategories.map((category) => (
                  <label
                    key={category._id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                  >
                    <input
                      checked={form.categories.includes(
                        category._id
                      )}
                      className="mt-1 h-4 w-4"
                      name="categories"
                      type="checkbox"
                      value={category._id}
                      onChange={handleCategoryChange}
                    />

                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {category.name}
                      </span>

                      {category.description ? (
                        <span className="mt-1 block text-xs text-slate-500">
                          {category.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="rounded-lg border border-slate-300 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <legend className="text-sm font-medium text-slate-700">
                Customizaciones
              </legend>

              <button
                className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-900"
                type="button"
                onClick={addCustomization}
              >
                Agregar opción
              </button>
            </div>

            {form.customizations.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                Todavía no agregaste customizaciones.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {form.customizations.map(
                  (customization, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <input
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="Nombre, ejemplo: Color"
                        value={customization.name}
                        onChange={(event) =>
                          updateCustomization(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                      />

                      <input
                        className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                        placeholder="Opciones separadas por coma"
                        value={customization.options}
                        onChange={(event) =>
                          updateCustomization(
                            index,
                            "options",
                            event.target.value
                          )
                        }
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Ejemplo: Azul, Naranja, Blanco, Negro
                      </p>

                      <button
                        className="mt-3 text-xs font-semibold text-red-700"
                        type="button"
                        onClick={() =>
                          removeCustomization(index)
                        }
                      >
                        Eliminar customización
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </fieldset>

          <input
            name="customizations"
            type="hidden"
            value={JSON.stringify(
              getCustomizationsForSubmit()
            )}
          />

          <div className="flex gap-3">
            <button
              className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Guardando..."
                : editingId
                  ? "Actualizar"
                  : "Crear"}
            </button>

            <button
              className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
              type="button"
              onClick={resetForm}
            >
              Limpiar
            </button>
          </div>
        </form>

        {message ? (
          <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Productos
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Productos cargados en el ecommerce de Mutuo.
            </p>
          </div>

          <button
            className="rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700"
            disabled={isRefreshing}
            type="button"
            onClick={refreshProducts}
          >
            {isRefreshing ? "Recargando..." : "Recargar"}
          </button>
        </div>

        {initialProducts.length === 0 ? (
          <p className="mt-6 text-slate-600">
            Todavía no hay productos cargados.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {initialProducts.map((product) => (
              <article
                key={product._id}
                className="rounded-lg border border-slate-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600">
                      {product.description || "Sin descripción"}
                    </p>
                  </div>

                  <div className="text-right text-sm text-slate-700">
                    <p className="font-semibold">
                      ${product.price}
                    </p>
                    <p>Stock: {product.stock}</p>
                  </div>
                </div>

                <p className="mt-3 break-all text-xs text-slate-500">
                  ID: {product._id}
                </p>

                {product.categories?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <span
                        key={
                          typeof category === "string"
                            ? category
                            : category._id
                        }
                        className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
                      >
                        {typeof category === "string"
                          ? category
                          : category.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                {product.customizations?.length ? (
                  <div className="mt-4 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-950">
                      Customizaciones
                    </p>

                    <div className="mt-2 space-y-2">
                      {product.customizations.map(
                        (customization, index) => (
                          <p
                            key={index}
                            className="text-sm text-blue-900"
                          >
                            <span className="font-medium">
                              {customization.name}:
                            </span>{" "}
                            {customization.options?.join(", ")}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex gap-3">
                  <button
                    className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900"
                    type="button"
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </button>

                  <button
                    className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-900"
                    type="button"
                    onClick={() =>
                      handleDelete(product._id)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}