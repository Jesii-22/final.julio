"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const instagramUrl =
  "https://www.instagram.com/mutuo.3d?igsh=ZjFrd2VteTh1dm1j";

const whatsappUrl =
  "https://wa.me/5491126444064?text=Hola%20Mutuo%2C%20quer%C3%ADa%20hacer%20una%20consulta.";

const emailUrl =
  "mailto:mutuo.3d@gmail.com";

const locationUrl =
  "https://www.google.com/maps/search/?api=1&query=Garibaldi+1506+Ramos+Mejia";

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />

      <path d="M9 8.5c.4 2.5 2 4.2 4.7 5.2" />

      <path d="M9 8.5 10 8l1.1 2-1 .8" />

      <path d="m13.7 13.7.8-1 2 1-.5 1" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const footerLinks = [
  {
    href: "/",
    label: "Inicio",
  },
  {
    href: "/products",
    label: "Productos",
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
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-blue-900 bg-blue-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Marca */}
        <div>
          <Link
            className="inline-flex items-center text-3xl font-bold tracking-tight text-white transition hover:text-blue-100"
            href="/"
          >
            mutuo

            <span className="relative ml-0.5 text-orange-400">
              .

              <span className="absolute bottom-1 left-0 h-2 w-2 animate-ping rounded-full bg-orange-400/50" />
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-blue-100">
            Objetos funcionales impresos en
            3D para organizar, simplificar y
            acompañar los espacios de todos
            los días.
          </p>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
            Diseño funcional para el hogar
          </p>
        </div>

        {/* Navegación */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
            Navegación
          </h2>

          <div className="mt-5 flex flex-col items-start gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                className="text-sm text-blue-100 transition duration-200 hover:translate-x-1 hover:text-orange-300"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contacto */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
            Contacto
          </h2>

          <div className="mt-5 space-y-4">
            <a
              className="group flex items-start gap-3 text-sm text-blue-100 transition hover:text-orange-300"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="mt-0.5 transition duration-200 group-hover:scale-110">
                <WhatsAppIcon />
              </span>

              <span>
                +54 9 11 2644-4064
              </span>
            </a>

            <a
              className="group flex items-start gap-3 text-sm text-blue-100 transition hover:text-orange-300"
              href={emailUrl}
            >
              <span className="mt-0.5 transition duration-200 group-hover:scale-110">
                <MailIcon />
              </span>

              <span className="break-all">
                mutuo.3d@gmail.com
              </span>
            </a>

            <a
              className="group flex items-start gap-3 text-sm leading-6 text-blue-100 transition hover:text-orange-300"
              href={locationUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="mt-0.5 shrink-0 transition duration-200 group-hover:scale-110">
                <LocationIcon />
              </span>

              <span>
                Garibaldi 1506,
                <br />
                Ramos Mejía
              </span>
            </a>
          </div>
        </div>

        {/* Redes y horarios */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-orange-300">
            Seguinos
          </h2>

          <a
            aria-label="Instagram de Mutuo"
            className="group mt-5 inline-flex items-center gap-3 rounded-xl border border-blue-700 bg-blue-900/60 px-4 py-3 text-sm font-semibold text-blue-100 transition duration-200 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="transition duration-200 group-hover:rotate-6 group-hover:scale-110">
              <InstagramIcon />
            </span>

            @mutuo.3d
          </a>

          <div className="mt-6 flex items-start gap-3 text-sm leading-6 text-blue-100">
            <span className="mt-0.5 shrink-0 text-orange-300">
              <ClockIcon />
            </span>

            <div>
              <p>
                Lunes a viernes
              </p>

              <p className="font-semibold text-white">
                9:00 a 18:30
              </p>

              <p className="mt-2">
                Sábados
              </p>

              <p className="font-semibold text-white">
                10:00 a 13:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Parte inferior */}
      <div className="border-t border-blue-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-center text-xs text-blue-200 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left">
          <p>
            © 2026 Mutuo. Todos los derechos
            reservados.
          </p>

          <p>
            Objetos funcionales impresos en 3D.
          </p>
        </div>
      </div>
    </footer>
  );
}