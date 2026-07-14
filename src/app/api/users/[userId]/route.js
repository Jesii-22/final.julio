import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

function cleanText(value) {
  return String(value || "").trim();
}

function serializeUser(user) {
  return {
    _id: user._id.toString(),
    name: user.name || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    postalCode: user.postalCode || "",
    role: user.role || "user",

    createdAt:
      user.createdAt?.toISOString?.() ||
      null,

    updatedAt:
      user.updatedAt?.toISOString?.() ||
      null,
  };
}

export async function GET(
  request,
  { params }
) {
  try {
    const { userId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "El ID del usuario no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const user = await User.findById(
      userId
    )
      .select(
        "name lastName email phone address city postalCode role createdAt updatedAt"
      )
      .lean();

    if (!user) {
      return Response.json(
        {
          ok: false,
          message:
            "El usuario no fue encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      ok: true,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error(
      "Error GET perfil:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          "No se pudo obtener el perfil.",

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

export async function PUT(
  request,
  { params }
) {
  try {
    const { userId } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        userId
      )
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "El ID del usuario no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const profileData = {
      name: cleanText(body.name),
      lastName: cleanText(body.lastName),

      email: cleanText(
        body.email
      ).toLowerCase(),

      phone: cleanText(body.phone),
      address: cleanText(body.address),
      city: cleanText(body.city),

      postalCode: cleanText(
        body.postalCode
      ),
    };

    if (
      !profileData.name ||
      !profileData.lastName ||
      !profileData.email
    ) {
      return Response.json(
        {
          ok: false,
          message:
            "Completá nombre, apellido y email.",
        },
        {
          status: 400,
        }
      );
    }

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        profileData.email
      );

    if (!validEmail) {
      return Response.json(
        {
          ok: false,
          message:
            "Ingresá un email válido.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const duplicatedEmail =
      await User.exists({
        email: profileData.email,

        _id: {
          $ne: userId,
        },
      });

    if (duplicatedEmail) {
      return Response.json(
        {
          ok: false,
          message:
            "Ese email ya está registrado por otro usuario.",
        },
        {
          status: 409,
        }
      );
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        userId,

        {
          $set: profileData,
        },

        {
          returnDocument: "after",
          runValidators: true,
        }
      )
        .select(
          "name lastName email phone address city postalCode role createdAt updatedAt"
        )
        .lean();

    if (!updatedUser) {
      return Response.json(
        {
          ok: false,
          message:
            "El usuario no fue encontrado.",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      ok: true,
      message:
        "Perfil actualizado correctamente.",
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    console.error(
      "Error PUT perfil:",
      error
    );

    return Response.json(
      {
        ok: false,
        message:
          error.message ||
          "No se pudo actualizar el perfil.",

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