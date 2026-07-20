"use client";

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

      return (
        activeUser?.role === "admin"
      );
    });

  function isActiveLink(href) {
    if (href === "/") {
      return pathname === "/";
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex items-center text-2xl font-bold tracking-tight text-blue-700 transition hover:text-blue-800"
            href="/"
          >
            mutuo
            <span className="text-orange-500">
              .
            </span>
          </Link>

          <span className="hidden h-5 w-px bg-slate-300 sm:block" />

          <p className="hidden text-xs text-slate-500 sm:block">
            Objetos funcionales para el hogar
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-1">
            {visibleNavigationLinks.map(
              (link) => {
                const active =
                  isActiveLink(
                    link.href
                  );

                return (
                  <Link
                    key={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                    href={link.href}
                  >
                    {getLinkLabel(
                      link
                    )}
                  </Link>
                );
              }
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            {activeUser ? (
              <>
                <Link
                  className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                  href="/user"
                >
                  {`${activeUser.name || ""} ${
                    activeUser.lastName || ""
                  }`.trim() ||
                    "Mi cuenta"}
                </Link>

                <button
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  type="button"
                  onClick={logout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                href="/login"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}