import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

function serializeOrder(order) {
  return {
    _id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,

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
        order.payment?.status || "",

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
          order.payment?.surchargeAmount
        ) || 0,

      installments:
        Number(
          order.payment?.installments
        ) || 1,
    },

    products: (
      order.products || []
    ).map((item) => ({
      productId:
        item.productId.toString(),

      name: item.name,
      image: item.image || "",

      price:
        Number(item.price) || 0,

      quantity:
        Number(item.quantity) || 1,

      customizations:
        item.customizations || {},

      subtotal:
        Number(item.subtotal) || 0,
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

    createdAt:
      order.createdAt?.toISOString?.(),

    updatedAt:
      order.updatedAt?.toISOString?.(),
  };
}

export async function GET(
  request,
  { params }
) {
  const { id } = await params;

  const { searchParams } = new URL(
    request.url
  );

  const userId =
    searchParams.get("userId");

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    return Response.json(
      {
        ok: false,
        message:
          "El ID de la orden no es válido.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !userId ||
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

  try {
    await connectDB();

    const order = await Order.findOne({
      _id: id,
      user: userId,
    }).lean();

    if (!order) {
      return Response.json(
        {
          ok: false,
          message:
            "La orden no fue encontrada o no pertenece a este usuario.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      ok: true,
      order: serializeOrder(order),
    });
  } catch (error) {
    console.error(
      "Error GET detalle de orden:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo obtener la orden.",
      },
      {
        status: 500,
      }
    );
  }
}