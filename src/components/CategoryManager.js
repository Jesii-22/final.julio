"use client";

import {
  useCallback,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/categories";

const suggestedIcons = [
  "💡",
  "🏠",
  "🪴",
  "🖥️",
  "🍽️",
  "🔑",
  "🛋️",
  "🧵​",
  "📱",
  "🛏️​",
  "🚽​",
];

const initialForm = {
  name: "",
  description: "",
  icon: "",
};

export default function CategoryManager({
  initialCategories = [],
}) {
  const router = useRouter();

  const [form, setForm] =
    useState(initialForm);

  const [editingId, setEditingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    isRefreshing,
    startRefreshTransition,
  ] = useTransition();

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setEditingId("");
    setMessage("");
  }, []);

  const refreshCategories =
    useCallback(() => {
      startRefreshTransition(() => {
        router.refresh();
      });
    }, [router]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function selectIcon(icon) {
    setForm((current) => ({
      ...current,
      icon,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");

    const formData =
      new FormData(
        event.currentTarget
      );

    const action = editingId
      ? updateCategory.bind(
          null,
          editingId
        )
      : createCategory;

    try {
      const result = await action(
        null,
        formData
      );

      setMessage(result.message);

      if (result.ok) {
        resetForm();
        refreshCategories();
      }
    } catch {
      setMessage(
        "Ocurrió un error al guardar la categoría."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(category) {
    setEditingId(category._id);

    setForm({
      name: category.name || "",

      description:
        category.description || "",

      icon: category.icon || "",
    });

    setMessage(
      "Editando categoría."
    );
  }

  async function handleDelete(id) {
    const confirmed =
      window.confirm(
        "¿Seguro que querés eliminar esta categoría?"
      );

    if (!confirmed) {
      return;
    }

    const result =
      await deleteCategory(id);

    if (!result.ok) {
      setMessage(
        result.message ||
          "No se pudo eliminar la categoría."
      );

      return;
    }

    if (editingId === id) {
      resetForm();
    }

    setMessage(result.message);
    refreshCategories();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          Categorías
        </p>

        <h2 className="mt-2 text-2xl font-bold text-orange-600">
          {editingId
            ? "Editar categoría"
            : "Nueva categoría"}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Organizá los productos de
          Mutuo y elegí un ícono para
          identificar cada rubro.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Nombre
            </span>

            <input
              className="w-full rounded-xl border border-blue-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              name="name"
              placeholder="Ejemplo: Lámparas"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Descripción
            </span>

            <textarea
              className="min-h-28 w-full rounded-xl border border-blue-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              name="description"
              placeholder="Contá qué productos contiene esta categoría"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <fieldset className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <legend className="px-2 text-sm font-semibold text-blue-700">
              Ícono de la categoría
            </legend>

            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-3xl">
                {form.icon ||
                  form.name
                    ?.charAt(0)
                    .toUpperCase() ||
                  "C"}
              </div>

              <input
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-center text-2xl outline-none transition focus:border-orange-500"
                maxLength="8"
                name="icon"
                placeholder="💡"
                value={form.icon}
                onChange={handleChange}
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Podés escribir o pegar un
              emoji. Si lo dejás vacío,
              se mostrará la inicial.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {suggestedIcons.map(
                (icon) => (
                  <button
                    key={icon}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition hover:-translate-y-0.5 ${
                      form.icon === icon
                        ? "border-orange-400 bg-orange-100"
                        : "border-blue-100 bg-white hover:border-orange-200"
                    }`}
                    type="button"
                    onClick={() =>
                      selectIcon(icon)
                    }
                  >
                    {icon}
                  </button>
                )
              )}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? "Guardando..."
                : editingId
                  ? "Actualizar"
                  : "Crear categoría"}
            </button>

            <button
              className="rounded-xl border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              type="button"
              onClick={resetForm}
            >
              Limpiar
            </button>
          </div>
        </form>

        {message ? (
          <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
            {message}
          </p>
        ) : null}
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Catálogo
            </p>

            <h2 className="mt-2 text-2xl font-bold text-orange-600">
              Categorías creadas
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Lista de rubros disponibles
              para los productos.
            </p>
          </div>

          <button
            className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            disabled={isRefreshing}
            type="button"
            onClick={
              refreshCategories
            }
          >
            {isRefreshing
              ? "Recargando..."
              : "Recargar"}
          </button>
        </div>

        {initialCategories.length ===
        0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-blue-200 p-8 text-center text-slate-600">
            Todavía no hay categorías
            cargadas.
          </p>
        ) : (
          <div className="mt-6 grid gap-4">
            {initialCategories.map(
              (category) => (
                <article
                  key={category._id}
                  className="rounded-2xl border border-blue-100 p-5 transition hover:border-orange-200 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                      {category.icon ||
                        category.name
                          ?.charAt(0)
                          .toUpperCase() ||
                        "C"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-blue-700">
                        {category.name}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {category.description ||
                          "Sin descripción"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-800 transition hover:bg-orange-200"
                      type="button"
                      onClick={() =>
                        handleEdit(
                          category
                        )
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-200"
                      type="button"
                      onClick={() =>
                        handleDelete(
                          category._id
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}