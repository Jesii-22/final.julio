import {
  DISCOUNT_PERCENTAGE,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/commerce";

function formatPrice(price) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(price) || 0);
}

export default function CommerceBenefitsBar() {
  return (
    <section className="border-y border-orange-200 bg-orange-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-6 py-4 text-center sm:flex-row sm:gap-8">
        <p className="font-semibold text-orange-950">
          <span className="text-orange-600">
            {DISCOUNT_PERCENTAGE}% OFF
          </span>{" "}
          pagando en efectivo o transferencia
        </p>

        <span className="hidden h-5 w-px bg-orange-300 sm:block" />

        <p className="font-semibold text-orange-950">
          Envío gratis desde{" "}
          <span className="text-orange-600">
            {formatPrice(
              FREE_SHIPPING_THRESHOLD
            )}
          </span>
        </p>
      </div>
    </section>
  );
}