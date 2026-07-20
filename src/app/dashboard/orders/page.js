"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const STATUS_OPTIONS = [
  {
    value: "all",
    label: "Todas",
  },
  {
    value: "Active",
    label: "Activas",
  },
  {
    value: "Closed",
    label: "Finalizadas",
  },
  {
    value: "Shipped",
    label: "Enviadas",
  },
  {
    value: "Canceled",
    label: "Canceladas",
  },
];

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
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
      label: status || "Sin estado",
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

function getDeliveryLabel(delivery) {
  if (delivery?.label) {
    return delivery.label;
  }

  const labels = {
    pickup_store: "Retiro en Mutuo",
    pickup_point: "Punto de encuentro",
    shipping: "Envío a domicilio",
  };

  return labels[delivery?.method] || "";
}

async function readJsonResponse(response) {
  const responseText =
    await response.text();

  if (!responseText) {
    throw new Error(
      `La API devolvió una respuesta vacía. Código ${response.status}.`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      `La API devolvió una respuesta inválida. Código ${response.status}.`
    );
  }
}

async function fetchOrdersFromApi(signal) {
  const response = await fetch(
    "/api/orders",
    {
      cache: "no-store",
      signal,
    }
  );

  const data =
    await readJsonResponse(response);

  if (!response.ok || !data.ok) {
    throw new Error(
      data.message ||
        "No se pudieron cargar las órdenes."
    );
  }

  return data.orders || [];
}


export default function DashboardOrdersPage() {
  const [orders, setOrders] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

 async function loadOrders() {
  setIsLoading(true);
  setError("");

  try {
    const nextOrders =
      await fetchOrdersFromApi();

    setOrders(nextOrders);
  } catch (loadError) {
    console.error(
      "Error al cargar las órdenes:",
      loadError
    );

    setError(
      loadError.message ||
        "No se pudieron cargar las órdenes."
    );
  } finally {
    setIsLoading(false);
  }
}

useEffect(() => {
  const controller =
    new AbortController();

  async function loadInitialOrders() {
    try {
      const nextOrders =
        await fetchOrdersFromApi(
          controller.signal
        );

      if (
        !controller.signal.aborted
      ) {
        setOrders(nextOrders);
      }
    } catch (loadError) {
      if (
        loadError.name ===
        "AbortError"
      ) {
        return;
      }

      console.error(
        "Error al cargar las órdenes:",
        loadError
      );

      if (
        !controller.signal.aborted
      ) {
        setError(
          loadError.message ||
            "No se pudieron cargar las órdenes."
        );
      }
    } finally {
      if (
        !controller.signal.aborted
      ) {
        setIsLoading(false);
      }
    }
  }

  loadInitialOrders();

  return () => {
    controller.abort();
  };
}, []);


  const filteredOrders = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const customerName = [
        order.customerData?.name,
        order.customerData?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const searchableText = [
        order.orderNumber,
        customerName,
        order.customerData?.email,
        order.customerData?.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(
          normalizedSearch
        );

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  const statistics = useMemo(() => {
    const activeOrders = orders.filter(
      (order) =>
        order.status === "Active"
    ).length;

    const shippedOrders = orders.filter(
      (order) =>
        order.status === "Shipped"
    ).length;

    const canceledOrders = orders.filter(
      (order) =>
        order.status === "Canceled"
    ).length;

    const registeredSales = orders
      .filter(
        (order) =>
          order.status !== "Canceled"
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total || 0),
        0
      );

    return {
      activeOrders,
      shippedOrders,
      canceledOrders,
      registeredSales,
    };
  }, [orders]);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <Link
        className="font-semibold text-blue-700 hover:underline"
        href="/dashboard"
      >
        ← Volver al dashboard
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Administración
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Órdenes
          </h1>

          <p className="mt-3 text-slate-600">
            Revisá las compras, entregas,
            pagos y estados.
          </p>
        </div>

        <button
          className="rounded-xl border border-blue-300 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
          disabled={isLoading}
          type="button"
          onClick={loadOrders}
        >
          {isLoading
            ? "Actualizando..."
            : "Actualizar listado"}
        </button>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Órdenes totales
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {orders.length}
          </p>
        </article>

        <article className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm text-blue-700">
            Órdenes activas
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-950">
            {statistics.activeOrders}
          </p>
        </article>

        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-sm text-orange-700">
            Enviadas
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-950">
            {statistics.shippedOrders}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-700">
            Ventas registradas
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-950">
            {formatPrice(
              statistics.registeredSales
            )}
          </p>

          {statistics.canceledOrders > 0 ? (
            <p className="mt-2 text-xs text-emerald-800">
              No incluye{" "}
              {statistics.canceledOrders}{" "}
              orden(es) cancelada(s).
            </p>
          ) : null}
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Buscar
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              placeholder="Número, cliente, email o teléfono"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Estado
            </span>

            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-600">
          Cargando órdenes...
        </section>
      ) : null}

      {error ? (
        <section className="mt-8 rounded-2xl bg-red-50 p-5 text-red-800">
          {error}
        </section>
      ) : null}

      {!isLoading &&
      !error &&
      filteredOrders.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-950">
            No se encontraron órdenes
          </h2>

          <p className="mt-3 text-slate-600">
            Probá cambiar la búsqueda o el
            filtro seleccionado.
          </p>
        </section>
      ) : null}

      {!isLoading &&
      filteredOrders.length > 0 ? (
        <section className="mt-8 grid gap-5">
          {filteredOrders.map(
            (order) => {
              const status =
                getStatusData(
                  order.status
                );

              const customerName = [
                order.customerData?.name,
                order.customerData
                  ?.lastName,
              ]
                .filter(Boolean)
                .join(" ");

              const productsCount = (
                order.products || []
              ).reduce(
                (total, product) =>
                  total +
                  Number(
                    product.quantity || 0
                  ),
                0
              );

              return (
                <article
                  key={order._id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-950">
                          Orden N.º{" "}
                          {order.orderNumber}
                        </h2>

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

                  <div className="mt-6 grid gap-5 border-y border-slate-200 py-5 sm:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Cliente
                      </p>

                      <p className="mt-2 font-semibold text-slate-950">
                        {customerName ||
                          "Sin nombre"}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-600">
                        {
                          order.customerData
                            ?.email
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Productos
                      </p>

                      <p className="mt-2 font-medium text-slate-900">
                        {productsCount}{" "}
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
                            ?.method
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Entrega
                      </p>

                      <p className="mt-2 font-medium text-slate-900">
                        {getDeliveryLabel(
                          order.delivery
                        )}
                      </p>
                    </div>

                    <div className="flex items-end xl:justify-end">
                      <Link
                        className="inline-flex w-full justify-center rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 xl:w-auto"
                        href={`/dashboard/order/${order._id}`}
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      ) : null}
    </main>
  );
}