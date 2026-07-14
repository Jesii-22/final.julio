"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { useGlobalContext } from "@/context/GlobalContext";
import {
  TRANSFER_DATA,
  createEmailUrl,
  createWhatsAppUrl,
  formatPickupDate,
  getPickupTimeSlotLabel,
} from "@/lib/commerce";

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

function getPaymentLabel(method) {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    card: "Tarjeta de crédito",
  };

  return labels[method] || method;
}

function getStatusLabel(status) {
  const labels = {
    Active: "Activa",
    Closed: "Finalizada",
    Shipped: "Enviada",
    Canceled: "Cancelada",
  };

  return labels[status] || status;
}

export default function UserOrderPage() {
  const params = useParams();

  const { activeUser } =
    useGlobalContext();

  const [order, setOrder] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (
        !params?.id ||
        !activeUser?._id
      ) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/orders/${params.id}?userId=${activeUser._id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            data.message ||
              "No se pudo cargar la orden."
          );
        }

        if (!cancelled) {
          setOrder(data.order);
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
  }, [params?.id, activeUser?._id]);

  if (!activeUser) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-6 py-16">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">
            Iniciá sesión para ver esta orden
          </h1>

          <Link
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center text-slate-600">
        Cargando orden...
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-3xl bg-red-50 p-8 text-center text-red-800">
          {error ||
            "La orden no fue encontrada."}
        </div>

        <div className="mt-6 text-center">
          <Link
            className="font-semibold text-blue-700 hover:underline"
            href="/user"
          >
            Volver a mis compras
          </Link>
        </div>
      </main>
    );
  }

  const whatsappUrl =
    createWhatsAppUrl(order);

  const emailUrl =
    createEmailUrl(order);

  const canContact = [
    "cash",
    "transfer",
  ].includes(order.payment.method);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-16">
      <Link
        className="font-semibold text-blue-700 hover:underline"
        href="/user"
      >
        ← Volver a mis compras
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Detalle de compra
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Orden N.º{" "}
            {order.orderNumber}
          </h1>

          <p className="mt-3 text-slate-600">
            Realizada el{" "}
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Estado
          </p>

          <p className="mt-1 text-xl font-bold text-blue-950">
            {getStatusLabel(
              order.status
            )}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Productos
            </h2>

            <div className="mt-6 divide-y divide-slate-200">
              {order.products.map(
                (product) => (
                  <article
                    key={`${product.productId}-${JSON.stringify(
                      product.customizations
                    )}`}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex justify-between gap-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
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

                      <div className="text-right">
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

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Entrega
            </h2>

            <p className="mt-5 font-bold text-slate-950">
              {order.delivery.label}
            </p>

            {order.delivery.address ? (
              <p className="mt-2 text-slate-600">
                {order.delivery.address}

                {order.delivery.city
                  ? `, ${order.delivery.city}`
                  : ""}
              </p>
            ) : null}

            {order.delivery.postalCode ? (
              <p className="mt-1 text-sm text-slate-500">
                Código postal:{" "}
                {order.delivery.postalCode}
              </p>
            ) : null}

            {order.delivery.pickupDate ? (
              <div className="mt-5 rounded-2xl bg-orange-50 p-5 text-orange-950">
                <p className="font-semibold">
                  {formatPickupDate(
                    order.delivery.pickupDate
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

            {order.delivery.schedule ? (
              <p className="mt-4 text-sm text-slate-600">
                {order.delivery.schedule}
              </p>
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Datos del comprador
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nombre
                </p>

                <p className="mt-1 text-slate-900">
                  {order.customerData.name}{" "}
                  {
                    order.customerData
                      .lastName
                  }
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Teléfono
                </p>

                <p className="mt-1 text-slate-900">
                  {
                    order.customerData
                      .phone
                  }
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>

                <p className="mt-1 break-all text-slate-900">
                  {
                    order.customerData
                      .email
                  }
                </p>
              </div>
            </div>

            {order.customerData
              .observations ? (
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Observaciones
                </p>

                <p className="mt-2 text-slate-700">
                  {
                    order.customerData
                      .observations
                  }
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold text-slate-950">
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
                      .discountPercentage
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
                      .surchargePercentage
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

          <div className="mt-6 flex justify-between border-t border-slate-200 pt-6">
            <span className="text-lg font-bold">
              Total
            </span>

            <span className="text-2xl font-bold text-blue-700">
              {formatPrice(order.total)}
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Medio de pago
            </p>

            <p className="mt-2 font-bold text-slate-950">
              {getPaymentLabel(
                order.payment.method
              )}
            </p>

            {order.payment.method ===
            "card" ? (
              <p className="mt-1 text-sm text-slate-600">
                {
                  order.payment
                    .installments
                }{" "}
                cuota(s)
              </p>
            ) : null}
          </div>

          {order.payment.method ===
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

          {canContact ? (
            <div className="mt-6 grid gap-3">
              <a
                className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white hover:bg-emerald-700"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                Contactar por WhatsApp
              </a>

              <a
                className="rounded-xl border border-blue-300 px-5 py-3 text-center font-semibold text-blue-700 hover:bg-blue-50"
                href={emailUrl}
              >
                Contactar por email
              </a>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}