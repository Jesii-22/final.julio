import Image from "next/image";
import Link from "next/link";

export default function HomeHero() {
  return (
    <section className="bg-slate-50 px-4 py-5 sm:px-6 sm:py-8">
      <div className="relative mx-auto min-h-560px w-full max-w-7xl overflow-hidden rounded-3xl border border-blue-100 bg-[#F8F7F4] shadow-lg shadow-blue-950/5 sm:min-h-600px">
        <Image
          alt="Objetos funcionales de Mutuo en un ambiente cálido y minimalista"
          className="object-cover object-right"
          fill
          priority
          sizes="100vw"
          src="/images/products/banner-mutuo.png"
        />

        {/* Degradado para asegurar que el texto se lea bien */}
        <div className="absolute inset-0 bg-linear-to-r from-[#F8F7F4] via-[#F8F7F4]/95 to-transparent sm:via-[#F8F7F4]/80" />

        <div className="relative z-10 flex min-h-560px items-center px-7 py-12 sm:min-h-600px sm:px-12 lg:px-16">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-700">
              Mutuo
            </p>

            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-[#212836] sm:text-5xl lg:text-6xl">
              Diseño con{" "}
              <span className="text-[#F16E53]">
                propósito.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Creamos objetos simples e inteligentes que mejoran la experiencia
              del hogar a través del diseño funcional, el orden y la
              practicidad.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-xl bg-[#3055C4] px-6 py-4 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-lg"
                href="#catalogo"
              >
                Ver tienda
              </Link>

              <Link
                className="inline-flex justify-center rounded-xl border border-[#3055C4] bg-white/80 px-6 py-4 font-semibold text-[#3055C4] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#F16E53] hover:bg-orange-50 hover:text-[#F16E53] hover:shadow-md"
                href="/categories"
              >
                Conocer categorías
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}