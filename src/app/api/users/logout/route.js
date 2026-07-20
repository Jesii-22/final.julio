import {
  clearSessionCookie,
} from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();

    return Response.json({
      ok: true,
      message:
        "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error(
      "Error al cerrar sesión:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo cerrar la sesión.",
      },
      {
        status: 500,
      }
    );
  }
}