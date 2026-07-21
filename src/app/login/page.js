"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useGlobalContext } from "@/context/GlobalContext";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();

  const { saveActiveUser } =
    useGlobalContext();

  const [form, setForm] =
    useState(initialForm);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/users/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.ok) {
        setMessage(
          data.message ||
            "No se pudo iniciar sesión."
        );

        return;
      }

      await saveActiveUser(data.user);

      router.push("/");
      router.refresh();
    } catch {
      setMessage(
        "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 shadow-lg shadow-blue-950/5 sm:p-10">
        <div className="text-center">
          <Link
            className="inline-flex text-3xl font-bold tracking-tight text-blue-700 transition hover:text-orange-600"
            href="/"
          >
            mutuo
            <span className="text-orange-500">
              .
            </span>
          </Link>

          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Mi cuenta
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-orange-600">
            Iniciar sesión
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-600">
            Ingresá a tu cuenta para
            guardar favoritos y consultar
            tus órdenes.
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </span>

            <input
              autoComplete="email"
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              name="email"
              placeholder="nombre@email.com"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Contraseña
            </span>

            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              minLength="6"
              name="password"
              placeholder="Mínimo 6 caracteres"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="w-full rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading
              ? "Ingresando..."
              : "Iniciar sesión"}
          </button>
        </form>

        {message ? (
          <p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-700">
            {message}
          </p>
        ) : null}

        <p className="mt-7 text-center text-sm text-slate-600">
          ¿Todavía no tenés una cuenta?{" "}
          <Link
            className="font-semibold text-blue-700 transition hover:text-orange-600"
            href="/register"
          >
            Registrate
          </Link>
        </p>
      </section>
    </main>
  );
}