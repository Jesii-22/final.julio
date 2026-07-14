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

export const TRANSFER_DATA = {
  provider: "AstroPay",
  cvu: "0000177505281002710985",
  alias: "mutuo.3d",
  holder: "Marzeniuk Jesica Antonella Belen",
  email: "mutuo.3d@gmail.com",
};

export const CONTACT_DATA = {
  whatsapp: "541126444064",
  email: "mutuo.3d@gmail.com",
};

export function createWhatsAppUrl(orderNumber) {
  const message = encodeURIComponent(
    `Hola Mutuo, te envío el comprobante correspondiente a la orden N.º ${orderNumber}.`
  );

  return `https://wa.me/${CONTACT_DATA.whatsapp}?text=${message}`;
}

export function createEmailUrl(orderNumber) {
  const subject = encodeURIComponent(
    `Comprobante orden N.º ${orderNumber}`
  );

  const body = encodeURIComponent(
    `Hola Mutuo:\n\nTe envío el comprobante correspondiente a la orden N.º ${orderNumber}.\n\nGracias.`
  );

  return `mailto:${CONTACT_DATA.email}?subject=${subject}&body=${body}`;
}

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
    Number(subtotal) * (percentage / 100)
  );
}

export function calculateShippingCost({
  postalCode,
  subtotal,
}) {
  const numericSubtotal = Number(subtotal) || 0;

  if (
    numericSubtotal >= FREE_SHIPPING_THRESHOLD
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
    normalizedPostalCode.replace(/\D/g, "").slice(0, 4)
  );

  if (!numericCode) {
    return {
      cost: 9000,
      zone: "Resto del país",
    };
  }

  /*
    Simulación académica de costos.

    1600 a 1899:
    Zona Oeste y parte de Gran Buenos Aires.

    1000 a 1499:
    Ciudad Autónoma de Buenos Aires.
  */

  if (numericCode >= 1600 && numericCode <= 1899) {
    return {
      cost: 5000,
      zone: "Zona Oeste / GBA",
    };
  }

  if (numericCode >= 1000 && numericCode <= 1499) {
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