import crypto from "node:crypto";

import mongoose from "mongoose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const SESSION_COOKIE_NAME =
  "mutuo_session";

const SESSION_DURATION_SECONDS =
  60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Falta configurar SESSION_SECRET en el archivo .env."
    );
  }

  return secret;
}

function createSignature(value) {
  return crypto
    .createHmac(
      "sha256",
      getSessionSecret()
    )
    .update(value)
    .digest("base64url");
}

export function createSessionToken(
  userId
) {
  const expiresAt =
    Date.now() +
    SESSION_DURATION_SECONDS * 1000;

  const payload =
    `${userId}.${expiresAt}`;

  const signature =
    createSignature(payload);

  return `${payload}.${signature}`;
}

export function verifySessionToken(
  token
) {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [
    userId,
    expiresAtText,
    signature,
  ] = parts;

  const payload =
    `${userId}.${expiresAtText}`;

  const expectedSignature =
    createSignature(payload);

  const receivedBuffer =
    Buffer.from(signature);

  const expectedBuffer =
    Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return null;
  }

  const isValid =
    crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );

  if (!isValid) {
    return null;
  }

  const expiresAt =
    Number(expiresAtText);

  if (
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    return null;
  }

  return {
    userId,
    expiresAt,
  };
}

export async function setSessionCookie(
  userId
) {
  const cookieStore =
    await cookies();

  const token =
    createSessionToken(userId);

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge:
        SESSION_DURATION_SECONDS,
    }
  );
}

export async function clearSessionCookie() {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );
}

export async function getCurrentUser() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

  const session =
    verifySessionToken(token);

  if (
    !session ||
    !mongoose.Types.ObjectId.isValid(
      session.userId
    )
  ) {
    return null;
  }

  await connectDB();

  const user = await User.findById(
    session.userId
  )
    .select(
      "name lastName email phone address city postalCode role createdAt"
    )
    .lean();

  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    name: user.name || "",
    lastName:
      user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    postalCode:
      user.postalCode || "",
    role: user.role || "user",
    createdAt: user.createdAt
      ? new Date(
          user.createdAt
        ).toISOString()
      : null,
  };
}

export async function getAdminUser() {
  const user =
    await getCurrentUser();

  if (
    !user ||
    user.role !== "admin"
  ) {
    return null;
  }

  return user;
}