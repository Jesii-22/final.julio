import {
  getCurrentUser,
} from "@/lib/auth";

export async function requireAdmin() {
  const user =
    await getCurrentUser();

  if (!user) {
    return {
      ok: false,

      response: Response.json(
        {
          ok: false,
          message:
            "Tenés que iniciar sesión.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      ok: false,

      response: Response.json(
        {
          ok: false,
          message:
            "No tenés permisos de administrador.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    ok: true,
    user,
  };
}