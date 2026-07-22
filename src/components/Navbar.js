"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useGlobalContext } from "@/context/GlobalContext";

const navigationLinks = [
  {
    href: "/",
    label: "Inicio",
  },
  {
    href: "/categories",
    label: "Categorías",
  },
  {
    href: "/favorites",
    label: "Favoritos",
  },
  {
    href: "/cart",
    label: "Carrito",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    adminOnly: true,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const {
    favorites,
    activeUser,
    cartItemsCount,
    logout,
  } = useGlobalContext();

  const visibleNavigationLinks =
    navigationLinks.filter((link) => {
      if (!link.adminOnly) {
        return true;
      }

      return activeUser?.role === "admin";
    });

  const userName = `${activeUser?.name || ""} ${
    activeUser?.lastName || ""
  }`.trim();

  function isActiveLink(href) {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/categories") {
      return (
        pathname === "/categories" ||
        pathname.startsWith("/category/")
      );
    }

    return pathname.startsWith(href);
  }

  function getLinkLabel(link) {
    if (link.href === "/favorites") {
      return `${link.label} (${favorites.length})`;
    }

    if (link.href === "/cart") {
      return `${link.label} (${cartItemsCount})`;
    }

    return link.label;
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex items-center text-2xl font-bold tracking-tight text-blue-700 transition hover:text-orange-600"
            href="/"
            onClick={closeMenu}
          >
            mutuo
            <span className="text-orange-500">
              .
            </span>
          </Link>

          <span className="hidden h-5 w-px bg-blue-200 lg:block" />

          <p className="hidden text-xs text-slate-500 lg:block">
            Objetos funcionales para el hogar
          </p>
        </div>

        {/* Navegación para computadora */}
        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-1">
            {visibleNavigationLinks.map(
              (link) => {
                const active =
                  isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    className={`rounded-xl px-3 py-2 text-sm font-medium transition duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                    href={link.href}
                  >
                    {getLinkLabel(link)}
                  </Link>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-blue-100 pl-4">
            {activeUser ? (
              <>
                <Link
                  className="rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-100"
                  href="/user"
                >
                  {userName || "Mi cuenta"}
                </Link>

                <button
                  className="rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
                  type="button"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-orange-500"
                href="/login"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>

        {/* Botón hamburguesa para celular */}
        <button
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen
              ? "Cerrar menú"
              : "Abrir menú"
          }
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-white transition hover:border-orange-200 hover:bg-orange-50 md:hidden"
          type="button"
          onClick={() =>
            setIsMenuOpen((current) => !current)
          }
        >
          <span
            className={`h-0.5 w-6 bg-blue-700 transition duration-300 ${
              isMenuOpen
                ? "translate-y-2 rotate-45"
                : ""
            }`}
          />

          <span
            className={`h-0.5 w-6 bg-blue-700 transition duration-300 ${
              isMenuOpen
                ? "opacity-0"
                : "opacity-100"
            }`}
          />

          <span
            className={`h-0.5 w-6 bg-blue-700 transition duration-300 ${
              isMenuOpen
                ? "-translate-y-2 -rotate-45"
                : ""
            }`}
          />
        </button>
      </nav>

      {/* Menú desplegable para celular */}
      {isMenuOpen ? (
        <div
          className="border-t border-blue-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {visibleNavigationLinks.map(
              (link) => {
                const active =
                  isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    className={`w-full rounded-xl px-4 py-3 text-base font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-700"
                    }`}
                    href={link.href}
                    onClick={closeMenu}
                  >
                    {getLinkLabel(link)}
                  </Link>
                );
              }
            )}

            <div className="mt-3 border-t border-blue-100 pt-4">
              {activeUser ? (
                <div className="flex flex-col gap-2">
                  <Link
                    className="w-full rounded-xl bg-orange-50 px-4 py-3 font-semibold text-orange-700 transition hover:bg-orange-100"
                    href="/user"
                    onClick={closeMenu}
                  >
                    {userName || "Mi cuenta"}
                  </Link>

                  <button
                    className="w-full rounded-xl border border-blue-200 px-4 py-3 text-left font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
                    type="button"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  className="flex w-full justify-center rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-orange-500"
                  href="/login"
                  onClick={closeMenu}
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}