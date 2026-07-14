"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useGlobalContext } from "@/context/GlobalContext";
import {
  FREE_SHIPPING_THRESHOLD,
  PICKUP_POINTS,
  STORE_PICKUP,
  TRANSFER_DATA,
  calculateDiscount,
  calculateShippingCost,
  createEmailUrl,
  createWhatsAppUrl,
  getDiscountPercentage,
} from "@/lib/commerce";

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

function getPaymentLabel(method) {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia bancaria",
    card: "Tarjeta",
  };

  return labels[method] || method;
}

const initialCardForm = {
  holder: "",
  number: "",
  expiration: "",
  securityCode: "",
};

export default function CheckoutPage() {
  const {
    cart,
    cartTotal,
    activeUser,
    clearCart,
  } = useGlobalContext();

  const [customerData, setCustomerData] = useState({
    name: activeUser?.name || "",
    lastName: activeUser?.lastName || "",
    email: activeUser?.email || "",
    phone: "",
    observations: "",
  });

  const [delivery, setDelivery] = useState({
    method: "pickup_store",
    pointCode: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [payment, setPayment] = useState({
    method: "",
    installments: 1,
  });

  const [cardForm, setCardForm] =
    useState(initialCardForm);

  const [shippingQuote, setShippingQuote] =
    useState(null);

  const [message, setMessage] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] =
    useState(false);

  const [createdOrder, setCreatedOrder] =
    useState(null);

  const discountPercentage =
    getDiscountPercentage(payment.method);

  const discountAmount = useMemo(
    () =>
      calculateDiscount(
        cartTotal,
        payment.method
      ),
    [cartTotal, payment.method]
  );

  const shippingCost = useMemo(() => {
    if (delivery.method === "pickup_store") {
      return 0;
    }

    if (delivery.method === "pickup_point") {
      return (
        PICKUP_POINTS[delivery.pointCode]?.cost || 0
      );
    }

    if (delivery.method === "shipping") {
      return shippingQuote?.cost || 0;
    }

    return 0;
  }, [
    delivery.method,
    delivery.pointCode,
    shippingQuote,
  ]);

  const finalTotal = Math.max(
    0,
    cartTotal - discountAmount + shippingCost
  );

  const amountForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - cartTotal
  );

  function handleCustomerChange(event) {
    const { name, value } = event.target;

    setCustomerData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function handleDeliveryMethodChange(method) {
    setDelivery((current) => ({
      ...current,
      method,
      pointCode:
        method === "pickup_point"
          ? current.pointCode
          : "",
    }));

    setShippingQuote(null);
    setMessage("");

    if (
      method === "shipping" &&
      payment.method === "cash"
    ) {
      setPayment({
        method: "",
        installments: 1,
      });
    }
  }

  function handleDeliveryChange(event) {
    const { name, value } = event.target;

    setDelivery((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "postalCode") {
      setShippingQuote(null);
    }

    setMessage("");
  }

  function handlePaymentMethodChange(method) {
    if (
      method === "cash" &&
      delivery.method === "shipping"
    ) {
      setMessage(
        "El efectivo está disponible únicamente para retiro o puntos de encuentro."
      );

      return;
    }

    setPayment((current) => ({
      ...current,
      method,
      installments: method === "card" ? 1 : 1,
    }));

    setMessage("");
  }

  function handleCardChange(event) {
    const { name, value } = event.target;

    setCardForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function handleCalculateShipping() {
    const postalCode = delivery.postalCode.trim();

    if (!postalCode) {
      setMessage(
        "Ingresá un código postal para calcular el envío."
      );

      return;
    }

    const quote = calculateShippingCost({
      postalCode,
      subtotal: cartTotal,
    });

    setShippingQuote(quote);
    setMessage("");
  }

  function validateCard() {
    if (payment.method !== "card") {
      return true;
    }

    const cardNumber = cardForm.number.replace(
      /\D/g,
      ""
    );

    const securityCode =
      cardForm.securityCode.replace(/\D/g, "");

    if (
      !cardForm.holder.trim() ||
      cardNumber.length < 13 ||
      !cardForm.expiration.trim() ||
      securityCode.length < 3
    ) {
      setMessage(
        "Completá correctamente los datos de la tarjeta."
      );

      return false;
    }

    return true;
  }

  function validateCheckout() {
    if (
      !customerData.name.trim() ||
      !customerData.lastName.trim() ||
      !customerData.email.trim() ||
      !customerData.phone.trim()
    ) {
      setMessage(
        "Completá nombre, apellido, email y teléfono."
      );

      return false;
    }

    if (!payment.method) {
      setMessage("Seleccioná un medio de pago.");
      return false;
    }

    if (
      delivery.method === "pickup_point" &&
      !delivery.pointCode
    ) {
      setMessage(
        "Seleccioná un punto de encuentro."
      );

      return false;
    }

    if (delivery.method === "shipping") {
      if (
        !delivery.address.trim() ||
        !delivery.city.trim() ||
        !delivery.postalCode.trim()
      ) {
        setMessage(
          "Completá dirección, localidad y código postal."
        );

        return false;
      }

      if (!shippingQuote) {
        setMessage(
          "Calculá el costo de envío antes de finalizar."
        );

        return false;
      }
    }

    return validateCard();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (!validateCheckout()) {
      return;
    }

    setIsCreatingOrder(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          userId: activeUser?._id || null,

          customerData,

          delivery: {
            method: delivery.method,
            pointCode: delivery.pointCode,
            address: delivery.address,
            city: delivery.city,
            postalCode: delivery.postalCode,
          },

          payment: {
            method: payment.method,
            installments: payment.installments,
          },

          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            customizations:
              item.customizations || {},
          })),
        }),
      });

      const contentType =
        response.headers.get("content-type") || "";

      const data = contentType.includes(
        "application/json"
      )
        ? await response.json()
        : {
            ok: false,
            message: await response.text(),
          };

      if (!response.ok || !data.ok) {
        setMessage(
          data.message ||
            "No se pudo generar la orden."
        );

        return;
      }

      setCreatedOrder(data.order);
      clearCart();
    } catch (error) {
      console.error(
        "Error al finalizar la compra:",
        error
      );

      setMessage(
        "Ocurrió un error al finalizar la compra."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  if (createdOrder) {
    const whatsappUrl = createWhatsAppUrl(
      createdOrder.orderNumber
    );

    const emailUrl = createEmailUrl(
      createdOrder.orderNumber
    );

    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-16">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Compra confirmada
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            ¡Gracias por tu compra!
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Tu orden es la{" "}
            <span className="font-bold text-blue-700">
              N.º {createdOrder.orderNumber}
            </span>
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Medio de pago
              </p>

              <p className="mt-2 font-semibold text-slate-950">
                {getPaymentLabel(
                  createdOrder.payment.method
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total
              </p>

              <p className="mt-2 text-xl font-bold text-blue-700">
                {formatPrice(createdOrder.total)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Forma de entrega
              </p>

              <p className="mt-2 font-semibold text-slate-950">
                {createdOrder.delivery.label}
              </p>

              {createdOrder.delivery.address ? (
                <p className="mt-1 text-sm text-slate-600">
                  {createdOrder.delivery.address}
                  {createdOrder.delivery.city
                    ? `, ${createdOrder.delivery.city}`
                    : ""}
                </p>
              ) : null}

              {createdOrder.delivery.schedule ? (
                <p className="mt-2 text-sm text-slate-600">
                  {createdOrder.delivery.schedule}
                </p>
              ) : null}
            </div>
          </div>

          {createdOrder.payment.method ===
          "transfer" ? (
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-blue-200 bg-blue-50 p-6 text-left">
              <h2 className="text-xl font-bold text-blue-950">
                Datos para realizar la transferencia
              </h2>

              <div className="mt-4 space-y-2 text-sm text-blue-950">
                <p>
                  <strong>Cuenta:</strong>{" "}
                  {TRANSFER_DATA.provider}
                </p>

                <p>
                  <strong>Alias:</strong>{" "}
                  {TRANSFER_DATA.alias}
                </p>

                <p className="break-all">
                  <strong>CVU:</strong>{" "}
                  {TRANSFER_DATA.cvu}
                </p>

                <p>
                  <strong>Titular:</strong>{" "}
                  {TRANSFER_DATA.holder}
                </p>
              </div>

              <p className="mt-5 text-sm text-blue-900">
                Cuando realices la transferencia,
                envianos el comprobante indicando el
                número de orden.
              </p>
            </div>
          ) : null}

          {createdOrder.payment.method === "cash" ? (
            <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-orange-50 p-5 text-sm text-orange-900">
              El pago en efectivo se realiza al momento
              de retirar o recibir el producto en el punto
              acordado.
            </p>
          ) : null}

          {createdOrder.payment.method === "card" ? (
            <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-blue-50 p-5 text-sm text-blue-900">
              El pago con tarjeta fue procesado como una
              simulación académica. No se realizó ningún
              cobro real.
            </p>
          ) : null}

          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            {createdOrder.payment.method ===
            "transfer" ? (
              <>
                <a
                  className="rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white hover:bg-emerald-700"
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Enviar comprobante por WhatsApp
                </a>

                <a
                  className="rounded-xl border border-blue-300 bg-white px-6 py-4 font-semibold text-blue-700 hover:bg-blue-50"
                  href={emailUrl}
                >
                  Enviar comprobante por email
                </a>
              </>
            ) : null}

            <Link
              className="rounded-xl bg-blue-700 px-6 py-4 font-semibold text-white hover:bg-blue-800"
              href="/"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-6 py-16">
        <section className="w-full max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Tu carrito está vacío
          </h1>

          <p className="mt-4 text-slate-600">
            Agregá un producto antes de continuar con la
            compra.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            href="/"
          >
            Ver productos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Finalizar compra
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Checkout
        </h1>

        <p className="mt-3 text-slate-600">
          Completá tus datos, elegí la forma de entrega y
          el medio de pago.
        </p>
      </div>

      <form
        className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              1. Datos de contacto
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  name="name"
                  value={customerData.name}
                  onChange={handleCustomerChange}
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Apellido
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  name="lastName"
                  value={customerData.lastName}
                  onChange={handleCustomerChange}
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  name="email"
                  type="email"
                  value={customerData.email}
                  onChange={handleCustomerChange}
                  required
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Teléfono
                </span>

                <input
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  name="phone"
                  placeholder="Ejemplo: 11 2644 4064"
                  value={customerData.phone}
                  onChange={handleCustomerChange}
                  required
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Observaciones
              </span>

              <textarea
                className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                name="observations"
                placeholder="Indicaciones, consultas u observaciones sobre la compra."
                value={customerData.observations}
                onChange={handleCustomerChange}
              />
            </label>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              2. Forma de entrega
            </h2>

            <div className="mt-6 space-y-4">
              <label
                className={`block cursor-pointer rounded-2xl border p-5 ${
                  delivery.method === "pickup_store"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex gap-3">
                  <input
                    checked={
                      delivery.method ===
                      "pickup_store"
                    }
                    name="deliveryMethod"
                    type="radio"
                    onChange={() =>
                      handleDeliveryMethodChange(
                        "pickup_store"
                      )
                    }
                  />

                  <div>
                    <p className="font-bold text-slate-950">
                      Retiro en Mutuo — Gratis
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {STORE_PICKUP.address}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {STORE_PICKUP.schedule}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      Otros horarios pueden coordinarse por
                      WhatsApp.
                    </p>
                  </div>
                </div>
              </label>

              <label
                className={`block cursor-pointer rounded-2xl border p-5 ${
                  delivery.method === "pickup_point"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex gap-3">
                  <input
                    checked={
                      delivery.method ===
                      "pickup_point"
                    }
                    name="deliveryMethod"
                    type="radio"
                    onChange={() =>
                      handleDeliveryMethodChange(
                        "pickup_point"
                      )
                    }
                  />

                  <div className="flex-1">
                    <p className="font-bold text-slate-950">
                      Punto de encuentro
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Costo: {formatPrice(2500)}
                    </p>
                  </div>
                </div>

                {delivery.method ===
                "pickup_point" ? (
                  <div className="mt-5 grid gap-3">
                    {Object.values(PICKUP_POINTS).map(
                      (point) => (
                        <label
                          key={point.code}
                          className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <input
                            checked={
                              delivery.pointCode ===
                              point.code
                            }
                            name="pointCode"
                            type="radio"
                            value={point.code}
                            onChange={
                              handleDeliveryChange
                            }
                          />

                          <span>
                            <span className="block font-semibold text-slate-950">
                              {point.label}
                            </span>

                            <span className="mt-1 block text-sm text-slate-600">
                              {point.schedule}
                            </span>
                          </span>
                        </label>
                      )
                    )}
                  </div>
                ) : null}
              </label>

              <label
                className={`block cursor-pointer rounded-2xl border p-5 ${
                  delivery.method === "shipping"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex gap-3">
                  <input
                    checked={
                      delivery.method === "shipping"
                    }
                    name="deliveryMethod"
                    type="radio"
                    onChange={() =>
                      handleDeliveryMethodChange(
                        "shipping"
                      )
                    }
                  />

                  <div>
                    <p className="font-bold text-slate-950">
                      Envío a domicilio
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Costo ficticio calculado según el
                      código postal.
                    </p>
                  </div>
                </div>

                {delivery.method === "shipping" ? (
                  <div className="mt-5 grid gap-4">
                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      name="address"
                      placeholder="Dirección y altura"
                      value={delivery.address}
                      onChange={handleDeliveryChange}
                    />

                    <input
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                      name="city"
                      placeholder="Localidad"
                      value={delivery.city}
                      onChange={handleDeliveryChange}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600"
                        name="postalCode"
                        placeholder="Código postal"
                        value={delivery.postalCode}
                        onChange={handleDeliveryChange}
                      />

                      <button
                        className="rounded-xl border border-blue-300 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                        type="button"
                        onClick={
                          handleCalculateShipping
                        }
                      >
                        Calcular envío
                      </button>
                    </div>

                    {shippingQuote ? (
                      <div className="rounded-xl bg-white p-4">
                        <p className="font-semibold text-slate-950">
                          {shippingQuote.zone}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          Envío:{" "}
                          {shippingQuote.cost === 0
                            ? "Gratis"
                            : formatPrice(
                                shippingQuote.cost
                              )}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </label>
            </div>

            {cartTotal >=
            FREE_SHIPPING_THRESHOLD ? (
              <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Tu compra tiene envío gratis por superar{" "}
                {formatPrice(
                  FREE_SHIPPING_THRESHOLD
                )}.
              </p>
            ) : (
              <p className="mt-5 rounded-xl bg-orange-50 p-4 text-sm text-orange-900">
                Te faltan{" "}
                <strong>
                  {formatPrice(
                    amountForFreeShipping
                  )}
                </strong>{" "}
                para obtener envío gratis.
              </p>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              3. Medio de pago
            </h2>

            <div className="mt-6 grid gap-4">
              <button
                className={`rounded-2xl border p-5 text-left ${
                  payment.method === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                } ${
                  delivery.method === "shipping"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={
                  delivery.method === "shipping"
                }
                type="button"
                onClick={() =>
                  handlePaymentMethodChange("cash")
                }
              >
                <p className="font-bold text-slate-950">
                  Efectivo — 15% de descuento
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Disponible para retiro y puntos de
                  encuentro.
                </p>
              </button>

              <button
                className={`rounded-2xl border p-5 text-left ${
                  payment.method === "transfer"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
                type="button"
                onClick={() =>
                  handlePaymentMethodChange(
                    "transfer"
                  )
                }
              >
                <p className="font-bold text-slate-950">
                  Transferencia — 15% de descuento
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  El comprobante puede enviarse por
                  WhatsApp o email.
                </p>
              </button>

              {payment.method === "transfer" ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="font-bold text-blue-950">
                    Datos de AstroPay
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-blue-950">
                    <p>
                      <strong>Alias:</strong>{" "}
                      {TRANSFER_DATA.alias}
                    </p>

                    <p className="break-all">
                      <strong>CVU:</strong>{" "}
                      {TRANSFER_DATA.cvu}
                    </p>

                    <p>
                      <strong>Titular:</strong>{" "}
                      {TRANSFER_DATA.holder}
                    </p>
                  </div>
                </div>
              ) : null}

              <button
                className={`rounded-2xl border p-5 text-left ${
                  payment.method === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                }`}
                type="button"
                onClick={() =>
                  handlePaymentMethodChange("card")
                }
              >
                <p className="font-bold text-slate-950">
                  Tarjeta
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Simulación de pago en 1 o 3 cuotas sin
                  interés.
                </p>
              </button>

              {payment.method === "card" ? (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                  <input
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 sm:col-span-2"
                    name="holder"
                    placeholder="Nombre del titular"
                    value={cardForm.holder}
                    onChange={handleCardChange}
                  />

                  <input
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 sm:col-span-2"
                    inputMode="numeric"
                    name="number"
                    placeholder="Número de tarjeta"
                    value={cardForm.number}
                    onChange={handleCardChange}
                  />

                  <input
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                    name="expiration"
                    placeholder="MM/AA"
                    value={cardForm.expiration}
                    onChange={handleCardChange}
                  />

                  <input
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3"
                    inputMode="numeric"
                    name="securityCode"
                    placeholder="Código de seguridad"
                    value={
                      cardForm.securityCode
                    }
                    onChange={handleCardChange}
                  />

                  <label className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Cuotas
                    </span>

                    <select
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                      value={payment.installments}
                      onChange={(event) =>
                        setPayment((current) => ({
                          ...current,
                          installments: Number(
                            event.target.value
                          ),
                        }))
                      }
                    >
                      <option value={1}>
                        1 cuota de{" "}
                        {formatPrice(cartTotal)}
                      </option>

                      <option value={3}>
                        3 cuotas de{" "}
                        {formatPrice(
                          cartTotal / 3
                        )}
                      </option>
                    </select>
                  </label>

                  <p className="text-xs text-slate-500 sm:col-span-2">
                    Los datos son únicamente para una
                    simulación. No se guardan ni se realiza
                    ningún cobro real.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-2xl font-bold text-slate-950">
            Resumen
          </h2>

          <div className="mt-6 space-y-4 border-b border-slate-200 pb-6">
            {cart.map((item) => (
              <div
                key={item.itemKey}
                className="flex justify-between gap-4 text-sm"
              >
                <p className="text-slate-600">
                  {item.name} × {item.quantity}
                </p>

                <p className="shrink-0 font-medium text-slate-900">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <p className="text-slate-600">
                Subtotal
              </p>

              <p className="font-medium text-slate-950">
                {formatPrice(cartTotal)}
              </p>
            </div>

            {discountPercentage > 0 ? (
              <div className="flex justify-between gap-4 text-emerald-700">
                <p>
                  Descuento {discountPercentage}%
                </p>

                <p className="font-semibold">
                  -{formatPrice(discountAmount)}
                </p>
              </div>
            ) : null}

            <div className="flex justify-between gap-4">
              <p className="text-slate-600">
                Entrega
              </p>

              <p className="font-medium text-slate-950">
                {shippingCost === 0
                  ? "Gratis"
                  : formatPrice(shippingCost)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="text-lg font-bold text-slate-950">
              Total
            </p>

            <p className="text-2xl font-bold text-blue-700">
              {formatPrice(finalTotal)}
            </p>
          </div>

          {payment.method === "card" &&
          payment.installments === 3 ? (
            <p className="mt-3 text-right text-sm text-slate-600">
              3 cuotas de{" "}
              <strong>
                {formatPrice(finalTotal / 3)}
              </strong>
            </p>
          ) : null}

          <button
            className="mt-7 w-full rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCreatingOrder}
            type="submit"
          >
            {isCreatingOrder
              ? "Generando orden..."
              : "Confirmar compra"}
          </button>

          {message ? (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              {message}
            </p>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Al confirmar la compra se generará una orden
            en MongoDB. Los pagos y envíos son simulados
            para este proyecto académico.
          </p>
        </aside>
      </form>
    </main>
  );
}