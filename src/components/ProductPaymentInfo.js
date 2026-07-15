import {
  DISCOUNT_PERCENTAGE,
  FREE_SHIPPING_THRESHOLD,
  calculateDiscount,
} from "@/lib/commerce";

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

export default function ProductPaymentInfo({
  price,
  compact = false,
}) {
  const numericPrice =
    Number(price) || 0;

  const discountAmount =
    calculateDiscount(
      numericPrice,
      "transfer"
    );

  const discountedPrice =
    numericPrice - discountAmount;

  if (compact) {
    return (
      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold text-emerald-700">
          {formatPrice(discountedPrice)}{" "}
          en efectivo o transferencia
        </p>

        <p className="text-xs text-slate-500">
          {DISCOUNT_PERCENTAGE}% de descuento
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">
        Beneficios de compra
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm text-slate-600">
            Efectivo o transferencia
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-700">
            {formatPrice(discountedPrice)}
          </p>

          <p className="mt-1 text-sm font-medium text-emerald-700">
            {DISCOUNT_PERCENTAGE}% de descuento
          </p>
        </div>

        <div className="border-t border-orange-200 pt-3">
          <p className="text-sm font-semibold text-orange-950">
            Envío gratis superando{" "}
            {formatPrice(
              FREE_SHIPPING_THRESHOLD
            )}
          </p>
        </div>
      </div>
    </section>
  );
}