"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useGlobalContext } from "@/context/GlobalContext";

const initialForm = {
  name: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { saveActiveUser } = useGlobalContext();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        setMessage(
          data.message || "No se pudo registrar el usuario."
        );
        return;
      }

      await saveActiveUser(data.user);

      router.push("/");
      router.refresh();
    } catch {
      setMessage(
        "Ocurrió un error al registrar el usuario."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <Link
            className="inline-flex text-3xl font-bold tracking-tight text-blue-700"
            href="/"
          >
            mutuo
            <span className="text-orange-500">.</span>
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-slate-950">
            Crear una cuenta
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Registrate para guardar favoritos y consultar tus compras.
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Nombre
            </span>

            <input
              autoComplete="given-name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Apellido
            </span>

            <input
              autoComplete="family-name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="lastName"
              placeholder="Tu apellido"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </span>

            <input
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="email"
              placeholder="nombre@email.com"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </span>

            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              minLength="6"
              name="password"
              placeholder="Mínimo 6 caracteres"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Repetir contraseña
            </span>

            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              minLength="6"
              name="confirmPassword"
              placeholder="Repetí la contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          <button
            className="w-full rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        {message ? (
          <p className="mt-5 rounded-xl bg-slate-100 p-4 text-center text-sm text-slate-700">
            {message}
          </p>
        ) : null}

        <p className="mt-7 text-center text-sm text-slate-600">
          ¿Ya tenés una cuenta?{" "}
          <Link
            className="font-semibold text-blue-700 hover:text-blue-900"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  );
}