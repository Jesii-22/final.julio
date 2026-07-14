import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/passwords";
import User from "@/models/User";

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name,
    lastName: user.lastName || "",
    email: user.email,
    role: user.role,
    favorites: (user.favorites || []).map((id) =>
      id.toString()
    ),
    createdAt: user.createdAt?.toISOString(),
  };
}

export async function POST(request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const lastName = String(body.lastName || "").trim();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!name || !lastName || !email || !password) {
      return Response.json(
        {
          ok: false,
          message:
            "Completá el nombre, apellido, email y contraseña.",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          ok: false,
          message:
            "La contraseña debe tener al menos 6 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return Response.json(
        {
          ok: false,
          message:
            "Ya existe un usuario registrado con ese email.",
        },
        {
          status: 409,
        }
      );
    }

    const user = await User.create({
      name,
      lastName,
      email,
      password: hashPassword(password),
      role: "user",
      favorites: [],
    });

    return Response.json(
      {
        ok: true,
        message: "Usuario registrado correctamente.",
        user: serializeUser(user),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error?.code === 11000) {
      return Response.json(
        {
          ok: false,
          message:
            "Ya existe un usuario registrado con ese email.",
        },
        {
          status: 409,
        }
      );
    }

    console.error("Error al registrar usuario:", error);

    return Response.json(
      {
        ok: false,
        message: "No se pudo registrar el usuario.",
      },
      {
        status: 500,
      }
    );
  }
}