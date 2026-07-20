import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

const LOW_STOCK_LIMIT = 5;

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

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function getStatusData(status) {
  const statusData = {
    Active: {
      label: "Activa",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    Closed: {
      label: "Finalizada",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    Shipped: {
      label: "Enviada",
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
    },

    Canceled: {
      label: "Cancelada",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  };

  return (
    statusData[status] || {
      label: status || "Sin estado",
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
    }
  );
}

async function getDashboardData() {
  try {
    await connectDB();

    const startOfMonth =
      new Date();

    startOfMonth.setDate(1);

    startOfMonth.setHours(
      0,
      0,
      0,
      0
    );

    const [
      totalOrders,
      activeOrders,
      registeredUsers,
      lowStockProducts,
      latestOrders,
      monthSalesResult,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        status: "Active",
      }),

      User.countDocuments(),

      Product.find({
        stock: {
          $lte: LOW_STOCK_LIMIT,
        },
      })
        .select("name stock")
        .sort({
          stock: 1,
          name: 1,
        })
        .limit(5)
        .lean(),

      Order.find()
        .select(
          "orderNumber status total customerData createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5)
        .lean(),

      Order.aggregate([
        {
          $match: {
            status: {
              $ne: "Canceled",
            },

            createdAt: {
              $gte: startOfMonth,
            },
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$total",
            },
          },
        },
      ]),
    ]);

    const monthSales =
      Number(
        monthSalesResult[0]?.total
      ) || 0;

    return {
      ok: true,
      totalOrders,
      activeOrders,
      registeredUsers,
      lowStockProducts,
      latestOrders,
      monthSales,
    };
  } catch (error) {
    console.error(
      "Error al cargar el resumen del dashboard:",
      error
    );

    return {
      ok: false,
    };
  }
}



export default async function DashboardSummary() {
  const dashboardData =
    await getDashboardData();

  if (!dashboardData.ok) {
    return (
      <section className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-2xl font-bold text-red-800">
          No se pudo cargar el resumen
        </h2>

        <p className="mt-3 text-red-700">
          Revisá que MongoDB esté iniciado
          y volvé a cargar la página.
        </p>
      </section>
    );
  }

  const {
    totalOrders,
    activeOrders,
    registeredUsers,
    lowStockProducts,
    latestOrders,
    monthSales,
  } = dashboardData;

  const summaryCards = [
      {
        label: "Órdenes totales",
        value: totalOrders,
        description:
          "Todas las compras registradas.",
        className:
          "border-blue-100 hover:border-blue-300",
      },

      {
        label: "Órdenes activas",
        value: activeOrders,
        description:
          "Pedidos que todavía están en proceso.",
        className:
          "border-orange-100 hover:border-orange-300",
      },

      {
        label: "Ventas del mes",
        value: formatPrice(
          monthSales
        ),
        description:
          "No incluye órdenes canceladas.",
        className:
          "border-blue-100 hover:border-blue-300",
      },

      {
        label: "Usuarios registrados",
        value: registeredUsers,
        description:
          "Personas con una cuenta en Mutuo.",
        className:
          "border-orange-100 hover:border-orange-300",
      },
    ];

    return (
      <section className="mt-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Resumen general
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-600">
            Estado actual de la tienda
          </h2>

          <p className="mt-3 max-w-2xl text-slate-600">
            Información actualizada de las
            ventas, los pedidos, los usuarios
            y el inventario de Mutuo.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(
            (card) => (
              <article
                key={card.label}
                className={`rounded-3xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${card.className}`}
              >
                <p className="text-sm font-semibold text-blue-700">
                  {card.label}
                </p>

                <p className="mt-3 text-3xl font-bold text-orange-600">
                  {card.value}
                </p>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {card.description}
                </p>
              </article>
            )
          )}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Actividad reciente
                </p>

                <h3 className="mt-2 text-2xl font-bold text-orange-600">
                  Últimas órdenes
                </h3>
              </div>

              <Link
                className="inline-flex justify-center rounded-xl border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900"
                href="/dashboard/orders"
              >
                Ver todas
              </Link>
            </div>

            {latestOrders.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
                <p className="font-semibold text-blue-900">
                  Todavía no hay órdenes
                </p>

                <p className="mt-2 text-sm text-blue-700">
                  Las nuevas compras aparecerán
                  en esta sección.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-blue-100">
                {latestOrders.map(
                  (order) => {
                    const status =
                      getStatusData(
                        order.status
                      );

                    const customerName = [
                      order.customerData
                        ?.name,
                      order.customerData
                        ?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <Link
                        key={order._id.toString()}
                        className="group flex flex-col justify-between gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                        href={`/dashboard/order/${order._id.toString()}`}
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="font-bold text-slate-950 transition group-hover:text-blue-700">
                              Orden N.º{" "}
                              {
                                order.orderNumber
                              }
                            </p>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {customerName ||
                              "Cliente sin nombre"}{" "}
                            ·{" "}
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </div>

                        <p className="font-bold text-orange-600">
                          {formatPrice(
                            order.total
                          )}
                        </p>
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Inventario
              </p>

              <h3 className="mt-2 text-2xl font-bold text-orange-600">
                Stock bajo
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Productos con{" "}
                {LOW_STOCK_LIMIT} unidades o
                menos.
              </p>
            </div>

            {lowStockProducts.length ===
            0 ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                <p className="font-semibold text-emerald-800">
                  El inventario está bien
                </p>

                <p className="mt-2 text-sm text-emerald-700">
                  No hay productos con poco
                  stock.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {lowStockProducts.map(
                  (product) => (
                    <div
                      key={product._id.toString()}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50/50 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Inventario disponible
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          Number(
                            product.stock
                          ) === 0
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {product.stock} u.
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </article>
        </div>
      </section>
    );
}