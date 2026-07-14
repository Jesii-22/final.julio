import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

function serializeOrder(order) {
  const productsCount = (
    order.products || []
  ).reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0),
    0
  );

  return {
    _id: order._id.toString(),

    orderNumber:
      Number(order.orderNumber) || 0,

    status: order.status || "Active",

    productsCount,

    payment: {
      method:
        order.payment?.method || "",

      status:
        order.payment?.status || "",

      installments:
        Number(
          order.payment?.installments
        ) || 1,
    },

    delivery: {
      method:
        order.delivery?.method || "",

      label:
        order.delivery?.label || "",
    },

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

    createdAt:
      order.createdAt?.toISOString?.() ||
      null,

    updatedAt:
      order.updatedAt?.toISOString?.() ||
      null,
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
            "El ID del usuario no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const userExists = await User.exists({
      _id: userId,
    });

    if (!userExists) {
      return Response.json(
        {
          ok: false,
          message:
            "El usuario no fue encontrado.",
        },
        {
          status: 404,
        }
      );
    }

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
      "Error GET órdenes del usuario:",
      error
    );

    return Response.json(
      {
        ok: false,

        message:
          "No se pudieron obtener las órdenes.",

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