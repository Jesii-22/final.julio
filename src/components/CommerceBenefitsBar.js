"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

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

function BenefitsBarContent() {
  const [isFloating, setIsFloating] =
    useState(false);

  const [isLeaving, setIsLeaving] =
    useState(false);

  const hasAnimatedRef = useRef(false);
  const hideTimeoutRef = useRef(null);
  const returnTimeoutRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      if (
        hasAnimatedRef.current ||
        window.scrollY < 180
      ) {
        return;
      }

      hasAnimatedRef.current = true;

      setIsFloating(true);
      setIsLeaving(false);

      hideTimeoutRef.current =
        window.setTimeout(() => {
          setIsLeaving(true);
        }, 4000);

      returnTimeoutRef.current =
        window.setTimeout(() => {
          setIsFloating(false);
          setIsLeaving(false);
        }, 4500);
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (hideTimeoutRef.current) {
        window.clearTimeout(
          hideTimeoutRef.current
        );
      }

      if (returnTimeoutRef.current) {
        window.clearTimeout(
          returnTimeoutRef.current
        );
      }
    };
  }, []);

  return (
    <div className="min-h-126px sm:min-h-49px">
      <section
        className={`border-orange-200 bg-orange-50 transition-all duration-500 ${
          isFloating
            ? `fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl border shadow-2xl shadow-slate-950/20 sm:bottom-auto sm:top-24 ${
                isLeaving
                  ? "translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              }`
            : "relative w-full border-b"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-6 py-3 text-center text-sm sm:flex-row sm:gap-6">
          <p className="font-semibold text-slate-900">
            <span
              aria-hidden="true"
              className="mr-2 text-orange-500"
            >
              ✦
            </span>

            <span className="text-orange-600">
              {DISCOUNT_PERCENTAGE}% OFF
            </span>{" "}
            en efectivo o transferencia
          </p>

          <span className="hidden h-5 w-px bg-orange-300 sm:block" />

          <p className="font-semibold text-slate-900">
            <span
              aria-hidden="true"
              className="mr-2 text-orange-500"
            >
              ✦
            </span>

            Envío gratis desde{" "}
            <span className="text-orange-600">
              {formatPrice(
                FREE_SHIPPING_THRESHOLD
              )}
            </span>
          </p>

          <span className="hidden h-5 w-px bg-orange-300 sm:block" />

          <p className="font-semibold text-slate-900">
            <span
              aria-hidden="true"
              className="mr-2 text-orange-500"
            >
              ✦
            </span>

            <span className="text-orange-600">
              3 cuotas
            </span>{" "}
            sin interés
          </p>
        </div>
      </section>
    </div>
  );
}

export default function CommerceBenefitsBar() {
  const pathname = usePathname();

  const shouldShow =
    pathname === "/" ||
    pathname === "/categories" ||
    pathname === "/favorites" ||
    pathname === "/cart" ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/product/");

  if (!shouldShow) {
    return null;
  }

  return (
    <BenefitsBarContent key={pathname} />
  );
}