import mongoose from "mongoose";

import {
  PICKUP_POINTS,
  STORE_PICKUP,
  calculateDiscount,
  calculateShippingCost,
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

    observations: cleanText(
      data.observations
    ),
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

  const validEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      customerData.email
    );

  if (!validEmail) {
    throw requestError(
      "Ingresá un email válido."
    );
  }
}

function normalizeDelivery(
  deliveryData,
  subtotal
) {
  const method = cleanText(
    deliveryData?.method
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
      shippingCost: 0,
    };
  }

  if (method === "pickup_point") {
    const pointCode = cleanText(
      deliveryData?.pointCode
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
      shippingCost: point.cost,
    };
  }

  if (method === "shipping") {
    const address = cleanText(
      deliveryData?.address
    );

    const city = cleanText(
      deliveryData?.city
    );

    const postalCode = cleanText(
      deliveryData?.postalCode
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
      schedule: "Entrega estimada de 3 a 7 días hábiles.",
      shippingCost: shipping.cost,
    };
  }

  throw requestError(
    "Seleccioná una forma de entrega."
  );
}

function normalizePayment(
  paymentData,
  subtotal,
  delivery
) {
  const method = cleanText(
    paymentData?.method
  );

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

  const installments =
    method === "card" &&
    Number(paymentData?.installments) === 3
      ? 3
      : 1;

  const discountPercentage =
    getDiscountPercentage(method);

  const discountAmount = calculateDiscount(
    subtotal,
    method
  );

  return {
    method,
    status: "Pending",
    discountPercentage,
    discountAmount,
    installments,
  };
}

function normalizeCustomizations(
  product,
  selectedCustomizations = {}
) {
  const normalized = {};

  for (const customization of
    product.customizations || []) {
    const name = cleanText(
      customization.name
    );

    const selectedValue = cleanText(
      selectedCustomizations[name]
    );

    const validOptions = (
      customization.options || []
    ).map(String);

    if (
      !selectedValue ||
      !validOptions.includes(selectedValue)
    ) {
      throw requestError(
        `Seleccioná una opción válida para ${name} en ${product.name}.`
      );
    }

    normalized[name] = selectedValue;
  }

  return normalized;
}

async function getNextOrderNumber() {
  const counter =
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
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

  /*
    Si se creó por primera vez con valor 1,
    lo llevamos a 1000.
  */
  if (counter.value < 1000) {
    counter.value = 1000;
    await counter.save();
  }

  return counter.value;
}

function serializeOrder(order) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    user: order.user
      ? order.user.toString()
      : null,

    customerData: order.customerData,
    delivery: order.delivery,
    payment: order.payment,

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
      .sort({
        createdAt: -1,
      })
      .lean();

    return Response.json({
      ok: true,
      orders: orders.map(serializeOrder),
    });
  } catch (error) {
    console.error("Error GET órdenes:", error);

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
        (id) =>
          !mongoose.Types.ObjectId.isValid(id)
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

      quantitiesByProduct.set(
        productId,
        (quantitiesByProduct.get(productId) ||
          0) + quantity
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
        const product =
          productsById.get(
            cleanText(item.productId)
          );

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

    const payment = normalizePayment(
      body.payment,
      subtotal,
      delivery
    );

    const shippingCost =
      delivery.shippingCost;

    const discountAmount =
      payment.discountAmount;

    const total = Math.max(
      0,
      subtotal -
        discountAmount +
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
    console.error("Error POST orden:", error);

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