import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

function serializeOrder(order) {
  return {
    _id: order._id.toString(),

    orderNumber:
      Number(order.orderNumber) || 0,

    status:
      order.status || "Active",

    user: order.user
      ? order.user.toString()
      : null,

    customerData: {
      name:
        order.customerData?.name || "",

      lastName:
        order.customerData?.lastName || "",

      email:
        order.customerData?.email || "",

      phone:
        order.customerData?.phone || "",

      observations:
        order.customerData
          ?.observations || "",
    },

    delivery: {
      method:
        order.delivery?.method || "",

      pointCode:
        order.delivery?.pointCode || "",

      label:
        order.delivery?.label || "",

      address:
        order.delivery?.address || "",

      city:
        order.delivery?.city || "",

      postalCode:
        order.delivery?.postalCode || "",

      zone:
        order.delivery?.zone || "",

      schedule:
        order.delivery?.schedule || "",

      pickupDate:
        order.delivery?.pickupDate || "",

      pickupTimeSlot:
        order.delivery
          ?.pickupTimeSlot || "",

      shippingCost:
        Number(
          order.delivery?.shippingCost
        ) || 0,
    },

    payment: {
      method:
        order.payment?.method || "",

      status:
        order.payment?.status ||
        "Pending",

      discountPercentage:
        Number(
          order.payment
            ?.discountPercentage
        ) || 0,

      discountAmount:
        Number(
          order.payment?.discountAmount
        ) || 0,

      surchargePercentage:
        Number(
          order.payment
            ?.surchargePercentage
        ) || 0,

      surchargeAmount:
        Number(
          order.payment
            ?.surchargeAmount
        ) || 0,

      installments:
        Number(
          order.payment?.installments
        ) || 1,
    },

    products: (
      order.products || []
    ).map((product) => ({
      productId: product.productId
        ? product.productId.toString()
        : "",

      name:
        product.name || "",

      image:
        product.image || "",

      price:
        Number(product.price) || 0,

      quantity:
        Number(product.quantity) || 0,

      customizations:
        product.customizations || {},

      subtotal:
        Number(product.subtotal) || 0,
    })),

    subtotal:
      Number(order.subtotal) || 0,

    shippingCost:
      Number(order.shippingCost) || 0,

    discountAmount:
      Number(order.discountAmount) || 0,

    surchargeAmount:
      Number(order.surchargeAmount) || 0,

    total:
      Number(order.total) || 0,

    stockDeducted:
      order.stockDeducted === true,

    stockRestored:
      order.stockRestored === true,

    createdAt: order.createdAt
      ? new Date(
          order.createdAt
        ).toISOString()
      : null,

    updatedAt: order.updatedAt
      ? new Date(
          order.updatedAt
        ).toISOString()
      : null,
  };
}

export async function GET(
  request,
  { params }
) {
  try {
    const { userId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "El usuario indicado no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const orders = await Order.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return Response.json({
      ok: true,

      orders: orders.map(
        serializeOrder
      ),
    });
  } catch (error) {
    console.error(
      "Error al obtener las órdenes del usuario:",
      error
    );

    return Response.json(
      {
        ok: false,

        message:
          "No se pudieron cargar las compras del usuario.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}