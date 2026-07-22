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
    const desktopQuery = window.matchMedia(
      "(min-width: 768px)"
    );

    function clearTimers() {
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
    }

    function resetAnimation() {
      clearTimers();

      hasAnimatedRef.current = false;

      setIsFloating(false);
      setIsLeaving(false);
    }

    function handleScroll() {
      /*
        En celular la barra siempre queda
        fija en su posición normal.
      */
      if (!desktopQuery.matches) {
        return;
      }

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

    function handleScreenChange(event) {
      if (!event.matches) {
        resetAnimation();
      }
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    desktopQuery.addEventListener(
      "change",
      handleScreenChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      desktopQuery.removeEventListener(
        "change",
        handleScreenChange
      );

      clearTimers();
    };
  }, []);

  return (
    <div className="min-h-118px md:min-h-49px">
      <section
        className={`border-orange-200 bg-orange-50 transition-all duration-500 ${
          isFloating
            ? `fixed left-1/2 top-24 z-40 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl border shadow-2xl shadow-slate-950/20 ${
                isLeaving
                  ? "translate-y-2 opacity-0"
                  : "translate-y-0 opacity-100"
              }`
            : "relative w-full border-b"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1.5 px-4 py-3 text-center text-xs sm:text-sm md:flex-row md:gap-6 md:px-6 md:text-base">
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

          <span className="hidden h-5 w-px bg-orange-300 md:block" />

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

          <span className="hidden h-5 w-px bg-orange-300 md:block" />

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