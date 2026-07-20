import mongoose from "mongoose";

import {
  getCurrentUser,
} from "@/lib/auth";

import {
  requireAdmin,
} from "@/lib/apiAuth";


import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "Active",
  "Closed",
  "Shipped",
  "Canceled",
];

function serializeOrder(order) {
  if (!order) {
    return null;
  }

  return JSON.parse(
    JSON.stringify(order)
  );
}

function getProductQuantities(order) {
  const quantities = new Map();

  for (const item of order.products || []) {
    if (!item.productId) {
      continue;
    }

    const productId =
      item.productId.toString();

    const quantity =
      Math.max(
        0,
        Number(item.quantity) || 0
      );

    if (quantity === 0) {
      continue;
    }

    const previousQuantity =
      quantities.get(productId) || 0;

    quantities.set(
      productId,
      previousQuantity + quantity
    );
  }

  return quantities;
}

async function restoreOrderStock(order) {
  const quantities =
    getProductQuantities(order);

  if (quantities.size === 0) {
    return;
  }

  await Product.bulkWrite(
    Array.from(
      quantities.entries()
    ).map(
      ([productId, quantity]) => ({
        updateOne: {
          filter: {
            _id: productId,
          },

          update: {
            $inc: {
              stock: quantity,
            },
          },
        },
      })
    )
  );
}

/*
  Obtener el detalle de una orden.
*/
export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

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

        const currentUser =
        await getCurrentUser();

        if (!currentUser) {
        return Response.json(
            {
            ok: false,
            message:
                "Tenés que iniciar sesión.",
            },
            {
            status: 401,
            }
        );
        }

    await connectDB();

    const order = await Order.findById(
      id
    ).lean();

    const orderUserId =
  order.user
    ? order.user.toString()
    : null;

const canViewOrder =
  currentUser.role === "admin" ||
  orderUserId === currentUser._id;

if (!canViewOrder) {
  return Response.json(
    {
      ok: false,
      message:
        "No tenés permiso para ver esta orden.",
    },
    {
      status: 403,
    }
  );
}

    if (!order) {
      return Response.json(
        {
          ok: false,
          message:
            "La orden no fue encontrada.",
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
      "Error al obtener la orden:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo obtener el detalle de la orden.",

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

/*
  Cambiar el estado de una orden.
*/
export async function PATCH(
    request,
    { params }
    ) {
    try {
        const authorization =
    await requireAdmin();

    if (!authorization.ok) {
    return authorization.response;
    }
    
    const { id } = await params;

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

    const body = await request.json();

    const nextStatus = String(
      body.status || ""
    ).trim();

    if (
      !VALID_STATUSES.includes(
        nextStatus
      )
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "El estado seleccionado no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const currentOrder =
      await Order.findById(id).lean();

    if (!currentOrder) {
      return Response.json(
        {
          ok: false,
          message:
            "La orden no fue encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      Una orden cancelada queda como
      estado definitivo.
    */
    if (
      currentOrder.status ===
        "Canceled" &&
      nextStatus !== "Canceled"
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "Una orden cancelada no puede volver a activarse.",
        },
        {
          status: 409,
        }
      );
    }

    /*
      Cancelación y devolución del stock.
    */
    if (
      nextStatus === "Canceled" &&
      currentOrder.status !== "Canceled"
    ) {
      const orderBeforeCancellation =
        await Order.findOneAndUpdate(
          {
            _id: id,

            status: {
              $ne: "Canceled",
            },

            stockRestored: {
              $ne: true,
            },
          },

          {
            $set: {
              status: "Canceled",

              stockRestored:
                currentOrder.stockDeducted ===
                true,
            },
          },

          {
            returnDocument: "before",
          }
        ).lean();

      if (
        orderBeforeCancellation &&
        orderBeforeCancellation
          .stockDeducted === true
      ) {
        try {
          await restoreOrderStock(
            orderBeforeCancellation
          );
        } catch (stockError) {
          /*
            Si falla la devolución del stock,
            recuperamos el estado anterior.
          */
          await Order.findByIdAndUpdate(
            id,
            {
              $set: {
                status:
                  orderBeforeCancellation.status,

                stockRestored: false,
              },
            }
          );

          throw stockError;
        }
      }
    } else {
      await Order.findByIdAndUpdate(
        id,

        {
          $set: {
            status: nextStatus,
          },
        },

        {
          returnDocument: "after",
          runValidators: true,
        }
      );
    }

    const updatedOrder =
      await Order.findById(id).lean();

    return Response.json({
      ok: true,

      message:
        nextStatus === "Canceled"
          ? currentOrder.stockDeducted ===
            true
            ? "Orden cancelada y stock restaurado correctamente."
            : "Orden cancelada correctamente."
          : "Estado actualizado correctamente.",

      order:
        serializeOrder(updatedOrder),
    });
  } catch (error) {
    console.error(
      "Error al actualizar la orden:",
      error
    );

    return Response.json(
      {
        ok: false,

        message:
          error.message ||
          "No se pudo actualizar la orden.",

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