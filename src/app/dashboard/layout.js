"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useGlobalContext } from "@/context/GlobalContext";

export default function DashboardLayout({
  children,
}) {
  const router = useRouter();

  const {
    activeUser,
    isSessionReady,
  } = useGlobalContext();

  const isAdmin =
    activeUser?.role === "admin";

  useEffect(() => {
    if (!isSessionReady) {
      return;
    }

    if (!activeUser) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [
    activeUser,
    isAdmin,
    isSessionReady,
    router,
  ]);

  if (!isSessionReady) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-orange-500" />

          <p className="mt-5 font-semibold text-blue-900">
            Verificando tu sesión...
          </p>
        </section>
      </main>
    );
  }

  if (!activeUser) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Sesión requerida
          </p>

          <h1 className="mt-3 text-3xl font-bold text-orange-600">
            Iniciá sesión para continuar
          </h1>

          <p className="mt-4 text-slate-600">
            El panel de administración es
            una sección privada de Mutuo.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
            href="/login"
          >
            Ir al inicio de sesión
          </Link>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-16">
        <section className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Acceso restringido
          </p>

          <h1 className="mt-3 text-3xl font-bold text-orange-600">
            No tenés permisos de administrador
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Esta sección está disponible
            únicamente para quienes administran
            la tienda.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl border border-blue-300 px-6 py-3 font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
            href="/"
          >
            Volver a la tienda
          </Link>
        </section>
      </main>
    );
  }

  return children;
}