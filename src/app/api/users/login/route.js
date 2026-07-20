import {
  setSessionCookie,
} from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/passwords";
import User from "@/models/User";

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name,
    lastName:
      user.lastName || "",
    email: user.email,
    role:
      user.role || "user",
    favorites: (
      user.favorites || []
    ).map((id) =>
      id.toString()
    ),
    createdAt:
      user.createdAt?.toISOString(),
  };
}

export async function POST(request) {
  try {
    const body =
      await request.json();

    const email = String(
      body.email || ""
    )
      .trim()
      .toLowerCase();

    const password = String(
      body.password || ""
    );

    if (!email || !password) {
      return Response.json(
        {
          ok: false,
          message:
            "Ingresá tu email y contraseña.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (
      !user ||
      !verifyPassword(
        password,
        user.password
      )
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "Email o contraseña incorrectos.",
        },
        {
          status: 401,
        }
      );
    }

    await setSessionCookie(
      user._id.toString()
    );

    return Response.json({
      ok: true,
      message:
        "Sesión iniciada correctamente.",
      user:
        serializeUser(user),
    });
  } catch (error) {
    console.error(
      "Error al iniciar sesión:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo iniciar sesión.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}