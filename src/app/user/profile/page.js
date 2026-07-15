"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import { useGlobalContext } from "@/context/GlobalContext";

const initialProfile = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

async function readJsonResponse(response) {
  const responseText =
    await response.text();

  if (!responseText) {
    throw new Error(
      `La API devolvió una respuesta vacía. Código ${response.status}.`
    );
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(
      `La API devolvió una respuesta inválida. Código ${response.status}.`
    );
  }
}

export default function UserProfilePage() {
  const { activeUser } =
    useGlobalContext();

  const [profile, setProfile] =
    useState(initialProfile);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

        const [
      showSuccessModal,
      setShowSuccessModal,
    ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!activeUser?._id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          `/api/users/${activeUser._id}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await readJsonResponse(response);

        if (!response.ok || !data.ok) {
          throw new Error(
            data.message ||
              "No se pudo cargar el perfil."
          );
        }

        if (!cancelled) {
          setProfile({
            name: data.user.name || "",
            lastName:
              data.user.lastName || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            address:
              data.user.address || "",
            city: data.user.city || "",
            postalCode:
              data.user.postalCode || "",
          });
        }
      } catch (error) {
        console.error(
          "Error al cargar perfil:",
          error
        );

        if (!cancelled) {
          setMessage(
            error.message ||
              "No se pudo cargar el perfil."
          );

          setMessageType("error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [activeUser?._id]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!activeUser?._id) {
      setMessage(
        "Tenés que iniciar sesión."
      );

      setMessageType("error");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/users/${activeUser._id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(profile),
        }
      );

      const data =
        await readJsonResponse(response);

      if (!response.ok || !data.ok) {
        throw new Error(
          data.message ||
            "No se pudo guardar el perfil."
        );
      }

      /*
        Actualizamos también el usuario guardado
        en el navegador.
      */
      const storedUser =
        window.localStorage.getItem(
          "mutuo_activeUser"
        );

      let previousUser = activeUser;

      if (storedUser) {
        try {
          previousUser =
            JSON.parse(storedUser);
        } catch {
          previousUser = activeUser;
        }
      }

      const updatedLocalUser = {
        ...previousUser,
        ...data.user,
      };

      window.localStorage.setItem(
        "mutuo_activeUser",
        JSON.stringify(
          updatedLocalUser
        )
      );

          setProfile({
        name: data.user.name || "",
        lastName: data.user.lastName || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        city: data.user.city || "",
        postalCode:
          data.user.postalCode || "",
      });

      setMessage("");
      setMessageType("");
      setShowSuccessModal(true);

    } catch (error) {
      console.error(
        "Error al guardar perfil:",
        error
      );

      setMessage(
        error.message ||
          "No se pudo guardar el perfil."
      );

      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  }

  if (!activeUser) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-6 py-16">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-950">
            Iniciá sesión para editar tu perfil
          </h1>

          <Link
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
            href="/login"
          >
            Iniciar sesión
          </Link>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 text-center text-slate-600">
        Cargando perfil...
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-16">
      <Link
        className="font-semibold text-blue-700 hover:underline"
        href="/user"
      >
        ← Volver a mi cuenta
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Mi cuenta
        </p>

        <h1 className="mt-2 text-4xl font-bold text-slate-950">
          Editar mis datos
        </h1>

        <p className="mt-3 text-slate-600">
          Estos datos se utilizarán para
          completar automáticamente tus
          próximas compras.
        </p>
      </div>

      <form
        className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Nombre
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Apellido
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="lastName"
              value={profile.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Teléfono
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="phone"
              placeholder="Ejemplo: 11 2644 4064"
              value={profile.phone}
              onChange={handleChange}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Dirección
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="address"
              placeholder="Calle y altura"
              value={profile.address}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Localidad
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="city"
              value={profile.city}
              onChange={handleChange}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Código postal
            </span>

            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              name="postalCode"
              value={profile.postalCode}
              onChange={handleChange}
            />
          </label>
        </div>

        {message ? (
          <p
            className={`mt-6 rounded-xl p-4 text-sm ${
              messageType === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {message}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            className="rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
            href="/user"
          >
            Cancelar
          </Link>

          <button
            className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            {isSaving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </form>
                        {showSuccessModal ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-5 py-10 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-success-title"
          >
            <section className="relative w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-2xl">
              <button
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
                type="button"
                aria-label="Cerrar mensaje"
                onClick={() =>
                  setShowSuccessModal(false)
                }
              >
                ×
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl font-bold text-emerald-700">
                ✓
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                Perfil actualizado
              </p>

              <h2
                className="mt-3 text-3xl font-bold text-slate-950"
                id="profile-success-title"
              >
                ¡Tus datos fueron guardados!
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Los vamos a utilizar para completar
                automáticamente tus próximas compras.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  className="rounded-xl border border-blue-300 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                  type="button"
                  onClick={() =>
                    window.location.assign("/user")
                  }
                >
                  Volver a mi perfil
                </button>

                <button
                  className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                  type="button"
                  onClick={() =>
                    window.location.assign("/")
                  }
                >
                  Ver productos
                </button>
              </div>

              <button
                className="mt-5 text-sm font-semibold text-slate-500 hover:text-slate-800"
                type="button"
                onClick={() =>
                  setShowSuccessModal(false)
                }
              >
                Seguir editando
              </button>
            </section>
          </div>
        ) : null}


    </main>
  );
}