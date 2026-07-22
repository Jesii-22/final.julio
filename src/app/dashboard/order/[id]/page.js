"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  TRANSFER_DATA,
  formatPickupDate,
  getPickupTimeSlotLabel,
} from "@/lib/commerce";

const STATUS_OPTIONS = [
  {
    value: "Active",
    label: "Activa",
  },
  {
    value: "Closed",
    label: "Finalizada",
  },
  {
    value: "Shipped",
    label: "Enviada",
  },
  {
    value: "Canceled",
    label: "Cancelada",
  },
];


const PAYMENT_STATUS_OPTIONS = [
  {
    value: "Pending",
    label: "Pendiente",
  },
  {
    value: "Paid",
    label: "Pagado",
  },
  {
    value: "Rejected",
    label: "Rechazado",
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
      dateStyle: "long",
      timeStyle: "short",
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

function getPaymentStatusLabel(status) {
  const labels = {
    Pending: "Pendiente",
    Paid: "Pagado",
    Rejected: "Rechazado",
  };

  return labels[status] || status;
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

export default function DashboardOrderPage() {
  const params = useParams();

  const [order, setOrder] =
    useState(null);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

    const [
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    ] = useState("");

    const [
    isSavingPayment,
    setIsSavingPayment,
    ] = useState(false);

    const [
    paymentSuccessMessage,
    setPaymentSuccessMessage,
    ] = useState("");

    const [
    paymentError,
    setPaymentError,
    ] = useState("");    

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [
  showCancelModal,
  setShowCancelModal,
] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!params?.id) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/orders/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await readJsonResponse(response);

        if (!response.ok || !data.ok) {
          throw new Error(
            data.message ||
              "No se pudo cargar la orden."
          );
        }

        if (!cancelled) {
          setOrder(data.order);
          setSelectedStatus(
            data.order.status
        );
        setSelectedPaymentStatus(
            data.order.payment?.status ||
                "Pending"
        );
        }
      } catch (loadError) {
        console.error(
          "Error al cargar la orden:",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError.message ||
              "No se pudo cargar la orden."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  async function updateOrderStatus(
  nextStatus
) {
  if (
    !order ||
    nextStatus === order.status
  ) {
    return false;
  }

  setIsSaving(true);
  setError("");
  setSuccessMessage("");

  try {
    const response = await fetch(
      `/api/orders/${order._id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          status: nextStatus,
        }),
      }
    );

    const data =
      await readJsonResponse(response);

    if (!response.ok || !data.ok) {
      throw new Error(
        data.message ||
          "No se pudo actualizar la orden."
      );
    }

    setOrder(data.order);

    setSelectedStatus(
      data.order.status
    );

    setSuccessMessage(
      data.message ||
        "Estado actualizado correctamente."
    );

    return true;
  } catch (updateError) {
    console.error(
      "Error al actualizar la orden:",
      updateError
    );

    setError(
      updateError.message ||
        "No se pudo actualizar la orden."
    );

    setSelectedStatus(
      order.status
    );

    return false;
  } finally {
    setIsSaving(false);
  }
}

async function handleStatusUpdate() {
  if (
    !order ||
    selectedStatus === order.status
  ) {
    return;
  }

  if (
    selectedStatus === "Canceled"
  ) {
    setError("");
    setSuccessMessage("");
    setShowCancelModal(true);

    return;
  }

  await updateOrderStatus(
    selectedStatus
  );
}

async function handleConfirmCancellation() {
  const wasUpdated =
    await updateOrderStatus(
      "Canceled"
    );

  if (wasUpdated) {
    setShowCancelModal(false);
  }
}

function handleCloseCancelModal() {
  if (isSaving) {
    return;
  }

  setShowCancelModal(false);
  setSelectedStatus(order.status);
  setError("");
}

async function handlePaymentStatusUpdate() {
  const currentPaymentStatus =
    order?.payment?.status ||
    "Pending";

  if (
    !order ||
    selectedPaymentStatus ===
      currentPaymentStatus
  ) {
    return;
  }

  setIsSavingPayment(true);
  setPaymentError("");
  setPaymentSuccessMessage("");

  try {
    const response = await fetch(
      `/api/orders/${order._id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          paymentStatus:
            selectedPaymentStatus,
        }),
      }
    );

    const data =
      await readJsonResponse(response);

    if (!response.ok || !data.ok) {
      throw new Error(
        data.message ||
          "No se pudo actualizar el pago."
      );
    }

    setOrder(data.order);

    setSelectedPaymentStatus(
      data.order.payment?.status ||
        selectedPaymentStatus
    );

    setPaymentSuccessMessage(
      data.message ||
        "Estado del pago actualizado correctamente."
    );
  } catch (updateError) {
    console.error(
      "Error al actualizar el pago:",
      updateError
    );

    setPaymentError(
      updateError.message ||
        "No se pudo actualizar el pago."
    );

    setSelectedPaymentStatus(
      currentPaymentStatus
    );
  } finally {
    setIsSavingPayment(false);
  }
}


  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16 text-center text-slate-600">
        Cargando orden...
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="rounded-3xl bg-red-50 p-8 text-center text-red-800">
          {error}
        </section>

        <div className="mt-6 text-center">
         <Link
        className="inline-flex items-center font-semibold text-blue-700 transition hover:-translate-x-1 hover:text-orange-600"
        href="/dashboard/orders"
        >
        ← Volver a órdenes
        </Link>

        <section className="mt-7 rounded-3xl border border-blue-100 bg-white px-6 py-9 shadow-lg shadow-blue-950/5 sm:px-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                Administración de orden
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-orange-600 sm:text-5xl">
                Orden N.º {order.orderNumber}
                </h1>

                <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
                >
                {status.label}
                </span>
            </div>

            <p className="mt-4 leading-7 text-slate-600">
                Creada el {formatDate(order.createdAt)}
            </p>
            </div>

            <div className="w-full rounded-2xl border border-blue-100 bg-blue-50/40 p-5 lg:max-w-md">
            <label>
                <span className="mb-2 block text-sm font-semibold text-blue-700">
                Cambiar estado de la orden
                </span>

                <select
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={isSaving || isCanceled}
                value={selectedStatus}
                onChange={(event) => {
                    setSelectedStatus(event.target.value);
                    setSuccessMessage("");
                    setError("");
                }}
                >
                {STATUS_OPTIONS.map((option) => (
                    <option
                    key={option.value}
                    value={option.value}
                    >
                    {option.label}
                    </option>
                ))}
                </select>
            </label>

            <button
                className="mt-4 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                isSaving ||
                isCanceled ||
                selectedStatus === order.status
                }
                type="button"
                onClick={handleStatusUpdate}
            >
                {isSaving
                ? "Guardando..."
                : "Guardar estado"}
            </button>

            {isCanceled ? (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                La orden está cancelada y no puede volver a activarse.
                </p>
            ) : null}

            {successMessage ? (
                <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                {successMessage}
                </p>
            ) : null}

            {error && order ? (
                <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                {error}
                </p>
            ) : null}
            </div>
        </div>
        </section>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const status = getStatusData(
    order.status
  );

  const customerName = [
    order.customerData?.name,
    order.customerData?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const isCanceled =
    order.status === "Canceled";

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 sm:py-16">
        <div className="mx-auto w-full max-w-7xl">
      <Link
        className="font-semibold text-blue-700 hover:underline"
        href="/dashboard/orders"
      >
        ← Volver a órdenes
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Administración de orden
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-bold text-slate-950">
              Orden N.º{" "}
              {order.orderNumber}
            </h1>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-3 text-slate-600">
            Creada el{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>

        <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:max-w-md">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Cambiar estado
            </span>

            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={
                isSaving ||
                isCanceled
              }
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(
                  event.target.value
                );

                setSuccessMessage("");
                setError("");
              }}
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

          <button
            className="mt-4 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              isSaving ||
              isCanceled ||
              selectedStatus ===
                order.status
            }
            type="button"
            onClick={
              handleStatusUpdate
            }
          >
            {isSaving
              ? "Guardando..."
              : "Guardar estado"}
          </button>

          {isCanceled ? (
            <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              La orden está cancelada y no
              puede volver a activarse.
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
              {successMessage}
            </p>
          ) : null}

          {error && order ? (
            <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              {error}
            </p>
          ) : null}
        </section>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-md">
            <h2 className="text-2xl font-bold text-orange-600">
              Productos
            </h2>

            <div className="mt-6 divide-y divide-slate-200">
              {(order.products || []).map(
                (product, index) => (
                  <article
                    key={`${product.productId}-${index}`}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row">
                      <div>
                        <h3 className="text-lg font-bold text-blue-700">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          Cantidad:{" "}
                          {product.quantity}
                        </p>

                        {Object.entries(
                          product.customizations ||
                            {}
                        ).length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {Object.entries(
                              product.customizations
                            ).map(
                              ([
                                name,
                                value,
                              ]) => (
                                <span
                                  key={name}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                >
                                  {name}: {value}
                                </span>
                              )
                            )}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm text-slate-500">
                          {formatPrice(
                            product.price
                          )}{" "}
                          c/u
                        </p>

                        <p className="mt-2 font-bold text-slate-950">
                          {formatPrice(
                            product.subtotal
                          )}
                        </p>
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          </section>

          <section className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-md">
              <h2 className="text-2xl font-bold text-orange-600">
                Cliente
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre
                  </p>

                  <p className="mt-1 font-medium text-slate-950">
                    {customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-slate-700">
                    {
                      order.customerData
                        ?.email
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Teléfono
                  </p>

                  <p className="mt-1 text-slate-700">
                    {
                      order.customerData
                        ?.phone
                    }
                  </p>
                </div>
              </div>

              {order.customerData
                ?.observations ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Observaciones
                  </p>

                  <p className="mt-2 text-sm text-slate-700">
                    {
                      order.customerData
                        .observations
                    }
                  </p>
                </div>
              ) : null}
            </article>

            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-md">
              <h2 className="text-2xl font-bold text-orange-600">
                Entrega
              </h2>

              <p className="mt-5 font-bold text-slate-950">
                {order.delivery?.label}
              </p>

              {order.delivery?.address ? (
                <p className="mt-2 text-slate-600">
                  {order.delivery.address}

                  {order.delivery.city
                    ? `, ${order.delivery.city}`
                    : ""}
                </p>
              ) : null}

              {order.delivery
                ?.postalCode ? (
                <p className="mt-1 text-sm text-slate-500">
                  Código postal:{" "}
                  {
                    order.delivery
                      .postalCode
                  }
                </p>
              ) : null}

              {order.delivery
                ?.pickupDate ? (
                <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-orange-950">
                  <p className="font-semibold">
                    {formatPickupDate(
                      order.delivery
                        .pickupDate
                    )}
                  </p>

                  <p className="mt-1 text-sm">
                    {getPickupTimeSlotLabel(
                      order.delivery
                        .pickupTimeSlot
                    )}
                  </p>
                </div>
              ) : null}

              {order.delivery?.schedule ? (
                <p className="mt-4 text-sm text-slate-600">
                  {
                    order.delivery
                      .schedule
                  }
                </p>
              ) : null}
            </article>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-md lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold text-orange-600">
            Resumen
          </h2>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">
                Subtotal
              </span>

              <span className="font-medium">
                {formatPrice(
                  order.subtotal
                )}
              </span>
            </div>

            {order.discountAmount > 0 ? (
              <div className="flex justify-between gap-4 text-emerald-700">
                <span>
                  Descuento{" "}
                  {
                    order.payment
                      ?.discountPercentage
                  }
                  %
                </span>

                <span className="font-semibold">
                  -
                  {formatPrice(
                    order.discountAmount
                  )}
                </span>
              </div>
            ) : null}

            {order.surchargeAmount > 0 ? (
              <div className="flex justify-between gap-4 text-orange-700">
                <span>
                  Recargo{" "}
                  {
                    order.payment
                      ?.surchargePercentage
                  }
                  %
                </span>

                <span className="font-semibold">
                  +
                  {formatPrice(
                    order.surchargeAmount
                  )}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between gap-4">
              <span className="text-slate-600">
                Entrega
              </span>

              <span className="font-medium">
                {order.shippingCost === 0
                  ? "Gratis"
                  : formatPrice(
                      order.shippingCost
                    )}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-4 border-t border-slate-200 pt-6">
            <span className="text-lg font-bold">
              Total
            </span>

            <span className="text-2xl font-bold text-blue-700">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Medio de pago
        </p>

        <p className="mt-2 font-bold text-slate-950">
            {getPaymentLabel(
            order.payment?.method
            )}
        </p>

        {order.payment?.method ===
        "card" ? (
            <p className="mt-1 text-sm text-slate-600">
            {order.payment.installments}{" "}
            cuota(s)
            </p>
        ) : null}

        <div className="mt-5 border-t border-blue-100 pt-5">
            <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
                Estado del pago
            </span>

            <select
                className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={isSavingPayment}
                value={selectedPaymentStatus}
                onChange={(event) => {
                setSelectedPaymentStatus(
                    event.target.value
                );

                setPaymentError("");
                setPaymentSuccessMessage("");
                }}
            >
                {PAYMENT_STATUS_OPTIONS.map(
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

            <button
            className="mt-3 w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
                isSavingPayment ||
                selectedPaymentStatus ===
                (order.payment?.status ||
                    "Pending")
            }
            type="button"
            onClick={
                handlePaymentStatusUpdate
            }
            >
            {isSavingPayment
                ? "Guardando..."
                : "Guardar estado del pago"}
            </button>

            {paymentSuccessMessage ? (
            <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                {paymentSuccessMessage}
            </p>
            ) : null}

            {paymentError ? (
            <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-800">
                {paymentError}
            </p>
            ) : null}
        </div>
        </div>

          {order.payment?.method ===
          "transfer" ? (
            <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-blue-950">
              <p>
                <strong>Alias:</strong>{" "}
                {TRANSFER_DATA.alias}
              </p>

              <p className="mt-2 break-all">
                <strong>CVU:</strong>{" "}
                {TRANSFER_DATA.cvu}
              </p>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-slate-200 p-4 text-sm">
            <p className="font-semibold text-slate-950">
              Control de stock
            </p>

            <p className="mt-2 text-slate-600">
              Descontado:{" "}
              <strong>
                {order.stockDeducted
                  ? "Sí"
                  : "No"}
              </strong>
            </p>

            <p className="mt-1 text-slate-600">
              Restaurado:{" "}
              <strong>
                {order.stockRestored
                  ? "Sí"
                  : "No"}
              </strong>
            </p>
          </div>
        </aside>
      </div>

{showCancelModal ? (
  <div
    className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/40 px-5 py-10 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cancel-order-title"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        handleCloseCancelModal();
      }
    }}
  >
    <section className="w-full max-w-md rounded-3xl border border-blue-100 bg-white p-7 shadow-2xl sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-xl font-bold text-orange-600">
          !
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Confirmar cancelación
          </p>

          <h2
            className="mt-2 text-2xl font-bold text-orange-600"
            id="cancel-order-title"
          >
            ¿Cancelar la orden N.º{" "}
            {order.orderNumber}?
          </h2>
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-600">
        La orden quedará cancelada de
        manera definitiva y no podrá
        volver a activarse.
      </p>

      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4">
        <p className="text-sm font-semibold text-orange-900">
          Las unidades compradas volverán
          automáticamente al stock.
        </p>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          className="rounded-xl border border-blue-200 px-5 py-3 font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSaving}
          type="button"
          onClick={
            handleCloseCancelModal
          }
        >
          Volver
        </button>

        <button
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
          type="button"
          onClick={
            handleConfirmCancellation
          }
        >
          {isSaving
            ? "Cancelando..."
            : "Sí, cancelar orden"}
        </button>
      </div>
    </section>
  </div>
   ) : null}
    </div>
  </main>
);
}