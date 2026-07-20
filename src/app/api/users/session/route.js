import {
  getCurrentUser,
} from "@/lib/auth";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          ok: false,
          message:
            "No hay una sesión activa.",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error(
      "Error al comprobar la sesión:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo comprobar la sesión.",
      },
      {
        status: 500,
      }
    );
  }
}