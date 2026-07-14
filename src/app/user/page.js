"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { useGlobalContext } from "@/context/GlobalContext";

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(dateString));
}

function getStatusData(status) {
  const statuses = {
    Active: {
      label: "Activa",
      className:
        "bg-blue-100 text-blue-800",
    },

    Closed: {
      label: "Finalizada",
      className:
        "bg-emerald-100 text-emerald-800",
    },

    Shipped: {
      label: "Enviada",
      className:
        "bg-orange-100 text-orange-800",
    },

    Canceled: {
      label: "Cancelada",
      className:
        "bg-red-100 text-red-800",
    },
  };

  return (
    statuses[status] || {
      label: status,
      className:
        "bg-slate-100 text-slate-700",
    }
  );
}

function getPaymentLabel(method) {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta de crédito",
  };

  return labels[method] || method;
}

export default function UserPage() {
  const { activeUser } =
    useGlobalContext();

  const [orders, setOrders] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      if (!activeUser?._id) {
        setOrders([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/users/${activeUser._id}/orders`,
          {
            cache: "no-store",
          }
        );

        const responseText =
        await response.text();

        let data = {};

        if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            throw new Error(
            `La API devolvió una respuesta inválida. Código: ${response.status}.`
            );
        }
        }

        if (!response.ok || !data.ok) {
          throw new Error(
            data.message ||
              "No se pudieron cargar las órdenes."
          );
        }

        if (!cancelled) {
          setOrders(data.orders || []);
        }
      } catch (loadError) {
        console.error(
          "Error al cargar las órdenes:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError.message ||
              "No se pudieron cargar las órdenes."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [activeUser?._id]);

  if (!activeUser) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Mi cuenta
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Iniciá sesión para ver tus compras
          </h1>

          <p className="mt-4 text-slate-600">
            Desde tu cuenta podés consultar
            todas las órdenes realizadas.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
              href="/login"
            >
              Iniciar sesión
            </Link>

            <Link
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              href="/register"
            >
              Crear cuenta
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Mi cuenta
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            {activeUser.name}{" "}
            {activeUser.lastName}
          </h1>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </p>

              <p className="mt-2 break-all font-medium text-slate-900">
                {activeUser.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Órdenes realizadas
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {orders.length}
              </p>
            </div>
          </div>

          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl border border-blue-300 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            href="/favorites"
          >
            Ver mis favoritos
          </Link>
        </aside>

        <section>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Historial
            </p>

            <h2 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Mis compras
            </h2>

            <p className="mt-3 text-slate-600">
              Consultá el estado y los datos
              de todas tus órdenes.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600">
              Cargando órdenes...
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800">
              {error}
            </div>
          ) : null}

          {!isLoading &&
          !error &&
          orders.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-2xl font-bold text-slate-950">
                Todavía no realizaste compras
              </h3>

              <p className="mt-3 text-slate-600">
                Cuando confirmes una orden,
                aparecerá en esta sección.
              </p>

              <Link
                className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                href="/"
              >
                Ver productos
              </Link>
            </div>
          ) : null}

          {!isLoading &&
          orders.length > 0 ? (
            <div className="mt-8 grid gap-5">
              {orders.map((order) => {
                const status =
                  getStatusData(
                    order.status
                  );

                return (
                  <article
                    key={order._id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold text-slate-950">
                            Orden N.º{" "}
                            {order.orderNumber}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <p className="text-2xl font-bold text-blue-700">
                        {formatPrice(
                          order.total
                        )}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Productos
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                          {
                            order.productsCount
                          }{" "}
                          unidad(es)
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Pago
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                          {getPaymentLabel(
                            order.payment
                              .method
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Entrega
                        </p>

                        <p className="mt-2 font-medium text-slate-900">
                          {
                            order.delivery
                              .label
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Link
                        className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                        href={`/user/order/${order._id}`}
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}