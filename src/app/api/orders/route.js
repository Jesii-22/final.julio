import mongoose from "mongoose";

import {
  CARD_INSTALLMENTS,
  PICKUP_POINTS,
  PICKUP_TIME_SLOTS,
  STORE_PICKUP,
  calculateCardSurcharge,
  calculateDiscount,
  calculateShippingCost,
  getCardSurchargePercentage,
  getDiscountPercentage,
} from "@/lib/commerce";
import { connectDB } from "@/lib/mongodb";
import Counter from "@/models/Counter";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

function requestError(message, status = 400) {
  const error = new Error(message);
  error.status = status;

  return error;
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeCustomerData(data = {}) {
  return {
    name: cleanText(data.name),
    lastName: cleanText(data.lastName),
    email: cleanText(data.email).toLowerCase(),
    phone: cleanText(data.phone),
    observations: cleanText(data.observations),
  };
}

function validateCustomerData(customerData) {
  if (
    !customerData.name ||
    !customerData.lastName ||
    !customerData.email ||
    !customerData.phone
  ) {
    throw requestError(
      "Completá nombre, apellido, email y teléfono."
    );
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    customerData.email
  );

  if (!validEmail) {
    throw requestError("Ingresá un email válido.");
  }
}

function normalizeCustomizations(
  product,
  selectedCustomizations = {}
) {
  const normalizedCustomizations = {};

  for (const customization of product.customizations || []) {
    const name = cleanText(customization.name);

    const selectedValue = cleanText(
      selectedCustomizations[name]
    );

    const availableOptions = (
      customization.options || []
    ).map((option) => String(option));

    if (
      !selectedValue ||
      !availableOptions.includes(selectedValue)
    ) {
      throw requestError(
        `Seleccioná una opción válida para ${name} en ${product.name}.`
      );
    }

    normalizedCustomizations[name] = selectedValue;
  }

  return normalizedCustomizations;
}

function normalizeDelivery(deliveryData = {}, subtotal) {
  const method = cleanText(deliveryData.method);

  const pickupDate = cleanText(
    deliveryData.pickupDate
  );

  const pickupTimeSlot = cleanText(
    deliveryData.pickupTimeSlot
  );

  if (method === "pickup_store") {
    return {
      method,
      pointCode: STORE_PICKUP.code,
      label: STORE_PICKUP.label,
      address: STORE_PICKUP.address,
      city: "Ramos Mejía",
      postalCode: "1704",
      zone: "Ramos Mejía",
      schedule: STORE_PICKUP.schedule,
      pickupDate,
      pickupTimeSlot,
      shippingCost: 0,
    };
  }

  if (method === "pickup_point") {
    const pointCode = cleanText(
      deliveryData.pointCode
    );

    const point = PICKUP_POINTS[pointCode];

    if (!point) {
      throw requestError(
        "Seleccioná un punto de encuentro válido."
      );
    }

    return {
      method,
      pointCode: point.code,
      label: point.label,
      address: point.address,
      city: "",
      postalCode: "",
      zone: "Punto de encuentro",
      schedule: point.schedule,
      pickupDate,
      pickupTimeSlot,
      shippingCost: point.cost,
    };
  }

  if (method === "shipping") {
    const address = cleanText(
      deliveryData.address
    );

    const city = cleanText(deliveryData.city);

    const postalCode = cleanText(
      deliveryData.postalCode
    );

    if (!address || !city || !postalCode) {
      throw requestError(
        "Completá dirección, localidad y código postal."
      );
    }

    const shipping = calculateShippingCost({
      postalCode,
      subtotal,
    });

    return {
      method,
      pointCode: "",
      label: "Envío a domicilio",
      address,
      city,
      postalCode,
      zone: shipping.zone,
      schedule:
        "Entrega estimada de 3 a 7 días hábiles.",
      pickupDate: "",
      pickupTimeSlot: "",
      shippingCost: shipping.cost,
    };
  }

  throw requestError(
    "Seleccioná una forma de entrega."
  );
}

function validatePickupSchedule(delivery) {
  if (
    !delivery.pickupDate ||
    !delivery.pickupTimeSlot
  ) {
    throw requestError(
      "Seleccioná el día y horario aproximado del retiro."
    );
  }

  if (
    !PICKUP_TIME_SLOTS[
      delivery.pickupTimeSlot
    ]
  ) {
    throw requestError(
      "Seleccioná una franja horaria válida."
    );
  }

  const pickupDate = new Date(
    `${delivery.pickupDate}T12:00:00`
  );

  if (Number.isNaN(pickupDate.getTime())) {
    throw requestError(
      "La fecha de retiro es inválida."
    );
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  pickupDate.setHours(0, 0, 0, 0);

  if (pickupDate < today) {
    throw requestError(
      "La fecha de retiro no puede ser anterior a hoy."
    );
  }

  const day = pickupDate.getDay();

  if (day === 0) {
    throw requestError(
      "Los domingos no se realizan retiros."
    );
  }

  if (
    day === 6 &&
    delivery.pickupTimeSlot !== "morning"
  ) {
    throw requestError(
      "Los sábados los retiros son únicamente por la mañana."
    );
  }
}

function normalizePayment(
  paymentData = {},
  subtotal,
  delivery
) {
  const method = cleanText(paymentData.method);

  if (
    !["cash", "transfer", "card"].includes(
      method
    )
  ) {
    throw requestError(
      "Seleccioná un medio de pago."
    );
  }

  if (
    method === "cash" &&
    delivery.method === "shipping"
  ) {
    throw requestError(
      "El pago en efectivo está disponible únicamente para retiros o puntos de encuentro."
    );
  }

  let installments = 1;

  if (method === "card") {
    const selectedInstallments = Number(
      paymentData.installments
    );

    installments =
      CARD_INSTALLMENTS[
        selectedInstallments
      ]
        ? selectedInstallments
        : 1;
  }

  const discountPercentage =
    getDiscountPercentage(method);

  const discountAmount =
    calculateDiscount(subtotal, method);

  const surchargePercentage =
    method === "card"
      ? getCardSurchargePercentage(
          installments
        )
      : 0;

  const surchargeAmount =
    method === "card"
      ? calculateCardSurcharge(
          subtotal,
          installments
        )
      : 0;

  return {
    method,

    status:
      method === "card"
        ? "Paid"
        : "Pending",

    discountPercentage,
    discountAmount,
    surchargePercentage,
    surchargeAmount,
    installments,
  };
}

async function getNextOrderNumber() {
  const existingCounter =
    await Counter.findOneAndUpdate(
      {
        name: "orders",
      },
      {
        $inc: {
          value: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

  if (existingCounter) {
    return existingCounter.value;
  }

  try {
    const newCounter = await Counter.create({
      name: "orders",
      value: 1000,
    });

    return newCounter.value;
  } catch (error) {
    /*
      Si dos órdenes intentan crear el contador
      al mismo tiempo, una vuelve a incrementarlo.
    */
    if (error?.code !== 11000) {
      throw error;
    }

    const retriedCounter =
      await Counter.findOneAndUpdate(
        {
          name: "orders",
        },
        {
          $inc: {
            value: 1,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!retriedCounter) {
      throw new Error(
        "No se pudo generar el número de orden."
      );
    }

    return retriedCounter.value;
  }
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  if (typeof user !== "object" || !user._id) {
    return user.toString();
  }

  return {
    _id: user._id.toString(),
    name: user.name || "",
    lastName: user.lastName || "",
    email: user.email || "",
  };
}

function serializeOrder(order) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    user: serializeUser(order.user),

    customerData: {
      name: order.customerData?.name || "",
      lastName:
        order.customerData?.lastName || "",
      email: order.customerData?.email || "",
      phone: order.customerData?.phone || "",
      observations:
        order.customerData?.observations || "",
    },

    delivery: {
      method: order.delivery?.method || "",
      pointCode:
        order.delivery?.pointCode || "",
      label: order.delivery?.label || "",
      address: order.delivery?.address || "",
      city: order.delivery?.city || "",
      postalCode:
        order.delivery?.postalCode || "",
      zone: order.delivery?.zone || "",
      schedule:
        order.delivery?.schedule || "",
      pickupDate:
        order.delivery?.pickupDate || "",
      pickupTimeSlot:
        order.delivery?.pickupTimeSlot || "",
      shippingCost:
        Number(
          order.delivery?.shippingCost
        ) || 0,
    },

    payment: {
      method: order.payment?.method || "",
      status: order.payment?.status || "",
      discountPercentage:
        Number(
          order.payment?.discountPercentage
        ) || 0,
      discountAmount:
        Number(
          order.payment?.discountAmount
        ) || 0,
      surchargePercentage:
        Number(
          order.payment?.surchargePercentage
        ) || 0,
      surchargeAmount:
        Number(
          order.payment?.surchargeAmount
        ) || 0,
      installments:
        Number(
          order.payment?.installments
        ) || 1,
    },

    products: (order.products || []).map(
      (item) => ({
        productId: item.productId.toString(),
        name: item.name,
        image: item.image || "",
        price: item.price,
        quantity: item.quantity,
        customizations:
          item.customizations || {},
        subtotal: item.subtotal,
      })
    ),

    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    discountAmount: order.discountAmount,
    surchargeAmount:
      order.surchargeAmount || 0,
    total: order.total,

    createdAt:
      order.createdAt?.toISOString?.(),

    updatedAt:
      order.updatedAt?.toISOString?.(),
  };
}

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find()
      .populate({
        path: "user",
        select: "name lastName email",
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    return Response.json({
      ok: true,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    console.error(
      "Error GET órdenes:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudieron obtener las órdenes.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const rawItems = Array.isArray(
      body.items
    )
      ? body.items
      : [];

    if (rawItems.length === 0) {
      throw requestError(
        "El carrito está vacío."
      );
    }

    const customerData =
      normalizeCustomerData(
        body.customerData
      );

    validateCustomerData(customerData);

    await connectDB();

    let userId = null;

    if (body.userId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          body.userId
        )
      ) {
        throw requestError(
          "ID de usuario inválido."
        );
      }

      const userExists = await User.exists({
        _id: body.userId,
      });

      if (!userExists) {
        throw requestError(
          "Usuario no encontrado.",
          404
        );
      }

      userId = body.userId;
    }

    const productIds = [
      ...new Set(
        rawItems.map((item) =>
          cleanText(item.productId)
        )
      ),
    ];

    if (
      productIds.some(
        (productId) =>
          !mongoose.Types.ObjectId.isValid(
            productId
          )
      )
    ) {
      throw requestError(
        "Uno o más productos son inválidos."
      );
    }

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
    }).lean();

    const productsById = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    const quantitiesByProduct = new Map();

    for (const item of rawItems) {
      const productId = cleanText(
        item.productId
      );

      const quantity = Number(
        item.quantity
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        throw requestError(
          "La cantidad de un producto es inválida."
        );
      }

      const previousQuantity =
        quantitiesByProduct.get(productId) || 0;

      quantitiesByProduct.set(
        productId,
        previousQuantity + quantity
      );
    }

    for (const [
      productId,
      requestedQuantity,
    ] of quantitiesByProduct) {
      const product =
        productsById.get(productId);

      if (!product) {
        throw requestError(
          "Uno de los productos ya no está disponible.",
          404
        );
      }

      if (
        requestedQuantity > product.stock
      ) {
        throw requestError(
          `No hay stock suficiente de ${product.name}.`
        );
      }
    }

    const orderItems = rawItems.map(
      (item) => {
        const productId = cleanText(
          item.productId
        );

        const product =
          productsById.get(productId);

        const quantity = Number(
          item.quantity
        );

        const price = Number(
          product.price
        );

        return {
          productId: product._id,
          name: product.name,
          image: product.image || "",
          price,
          quantity,

          customizations:
            normalizeCustomizations(
              product,
              item.customizations
            ),

          subtotal: price * quantity,
        };
      }
    );

    const subtotal = orderItems.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );

    const delivery = normalizeDelivery(
      body.delivery,
      subtotal
    );

    /*
      La fecha y el horario pertenecen a la entrega,
      por eso se solicitan para cualquier retiro,
      sea efectivo, transferencia o tarjeta.
    */
    if (delivery.method !== "shipping") {
      validatePickupSchedule(delivery);
    }

    const payment = normalizePayment(
      body.payment,
      subtotal,
      delivery
    );

    const shippingCost =
      delivery.shippingCost;

    const discountAmount =
      payment.discountAmount;

    const surchargeAmount =
      payment.surchargeAmount;

    const total = Math.max(
      0,
      subtotal -
        discountAmount +
        surchargeAmount +
        shippingCost
    );

    const orderNumber =
      await getNextOrderNumber();

    const order = await Order.create({
      orderNumber,
      status: "Active",
      user: userId,
      customerData,
      delivery,
      payment,
      products: orderItems,
      subtotal,
      shippingCost,
      discountAmount,
      surchargeAmount,
      total,
    });

    return Response.json(
      {
        ok: true,
        message:
          "Compra realizada correctamente.",
        order: serializeOrder(order),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Error POST orden:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          error.message ||
          "No se pudo crear la orden.",
      },
      {
        status: error.status || 500,
      }
    );
  }
}