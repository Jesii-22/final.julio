export const DISCOUNT_PERCENTAGE = 15;

export const FREE_SHIPPING_THRESHOLD = 180000;

export const STORE_PICKUP = {
  code: "mutuo_store",
  label: "Retiro en Mutuo",
  address: "Garibaldi 1506, Ramos Mejía",
  schedule:
    "Lunes a viernes de 9:00 a 18:30. Sábados de 10:00 a 13:00.",
  cost: 0,
};

export const PICKUP_POINTS = {
  plaza_san_justo: {
    code: "plaza_san_justo",
    label: "Plaza San Justo",
    address: "San Justo, Buenos Aires",
    schedule: "Día y horario a coordinar.",
    cost: 2500,
  },

  estacion_ramos_mejia: {
    code: "estacion_ramos_mejia",
    label: "Estación Ramos Mejía",
    address: "Ramos Mejía, Buenos Aires",
    schedule: "Día y horario a coordinar.",
    cost: 2500,
  },
};

export const PICKUP_TIME_SLOTS = {
  morning: {
    code: "morning",
    label: "Por la mañana",
    hours: "9:00 a 12:30",
  },

  afternoon: {
    code: "afternoon",
    label: "Por la tarde",
    hours: "13:00 a 18:30",
  },
};

export const CARD_INSTALLMENTS = {
  1: {
    installments: 1,
    surchargePercentage: 0,
    label: "1 cuota",
  },

  3: {
    installments: 3,
    surchargePercentage: 0,
    label: "3 cuotas sin interés",
  },

  6: {
    installments: 6,
    surchargePercentage: 15,
    label: "6 cuotas con 15% de recargo",
  },

  12: {
    installments: 12,
    surchargePercentage: 30,
    label: "12 cuotas con 30% de recargo",
  },
};

export const TRANSFER_DATA = {
  provider: "AstroPay",
  cvu: "0000177505281002710985",
  alias: "mutuo.3d",
  holder: "Marzeniuk Jesica Antonella Belen",
  email: "mutuo.3d@gmail.com",
};

export const CONTACT_DATA = {
  whatsapp: "5491126444064",
  email: "mutuo.3d@gmail.com",
};

export function getDiscountPercentage(paymentMethod) {
  if (
    paymentMethod === "cash" ||
    paymentMethod === "transfer"
  ) {
    return DISCOUNT_PERCENTAGE;
  }

  return 0;
}

export function calculateDiscount(
  subtotal,
  paymentMethod
) {
  const percentage =
    getDiscountPercentage(paymentMethod);

  return Math.round(
    (Number(subtotal) || 0) *
      (percentage / 100)
  );
}

export function getCardSurchargePercentage(
  installments
) {
  const plan =
    CARD_INSTALLMENTS[
      Number(installments)
    ];

  return plan?.surchargePercentage || 0;
}

export function calculateCardSurcharge(
  subtotal,
  installments
) {
  const percentage =
    getCardSurchargePercentage(
      installments
    );

  return Math.round(
    (Number(subtotal) || 0) *
      (percentage / 100)
  );
}

export function calculateShippingCost({
  postalCode,
  subtotal,
}) {
  const numericSubtotal =
    Number(subtotal) || 0;

  if (
    numericSubtotal >=
    FREE_SHIPPING_THRESHOLD
  ) {
    return {
      cost: 0,
      zone: "Envío gratis",
    };
  }

  const normalizedPostalCode = String(
    postalCode || ""
  )
    .trim()
    .toUpperCase();

  const numericCode = Number(
    normalizedPostalCode
      .replace(/\D/g, "")
      .slice(0, 4)
  );

  if (!numericCode) {
    return {
      cost: 9000,
      zone: "Resto del país",
    };
  }

  if (
    numericCode >= 1600 &&
    numericCode <= 1899
  ) {
    return {
      cost: 5000,
      zone: "Zona Oeste / GBA",
    };
  }

  if (
    numericCode >= 1000 &&
    numericCode <= 1499
  ) {
    return {
      cost: 7500,
      zone: "CABA",
    };
  }

  return {
    cost: 9000,
    zone: "Resto del país",
  };
}

export function formatPickupDate(
  dateString
) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    `${dateString}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

export function getPickupTimeSlotLabel(
  timeSlot
) {
  const slot =
    PICKUP_TIME_SLOTS[timeSlot];

  if (!slot) {
    return "";
  }

  return `${slot.label} (${slot.hours})`;
}

function createContactMessage(order) {
  const orderNumber =
    order?.orderNumber || "";

  const paymentMethod =
    order?.payment?.method || "";

  const pickupDate = formatPickupDate(
    order?.delivery?.pickupDate
  );

  const pickupTime =
    getPickupTimeSlotLabel(
      order?.delivery
        ?.pickupTimeSlot
    );

  if (paymentMethod === "cash") {
    return [
      "Hola Mutuo.",
      `Quiero reconfirmar el pago en efectivo y el retiro de la orden N.º ${orderNumber}.`,

      pickupDate
        ? `Fecha aproximada: ${pickupDate}.`
        : "",

      pickupTime
        ? `Horario aproximado: ${pickupTime}.`
        : "",

      "¿Me confirman la disponibilidad?",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (paymentMethod === "transfer") {
    return [
      "Hola Mutuo.",
      `Te envío el comprobante correspondiente a la orden N.º ${orderNumber}.`,

      pickupDate
        ? `Retiro previsto para: ${pickupDate}.`
        : "",

      pickupTime
        ? `Horario aproximado: ${pickupTime}.`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Hola Mutuo.",
    `Tengo una consulta sobre la orden N.º ${orderNumber}.`,
  ].join("\n");
}

export function createWhatsAppUrl(order) {
  const message = encodeURIComponent(
    createContactMessage(order)
  );

  return `https://wa.me/${CONTACT_DATA.whatsapp}?text=${message}`;
}

export function createEmailUrl(order) {
  const orderNumber =
    order?.orderNumber || "";

  const subject = encodeURIComponent(
    `Orden Mutuo N.º ${orderNumber}`
  );

  const body = encodeURIComponent(
    createContactMessage(order)
  );

  return `mailto:${CONTACT_DATA.email}?subject=${subject}&body=${body}`;
}