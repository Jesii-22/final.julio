import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(
    String(password),
    salt,
    KEY_LENGTH
  ).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
  if (!storedPassword) {
    return false;
  }

  const [salt, storedHash] = storedPassword.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const storedHashBuffer = Buffer.from(storedHash, "hex");

  const suppliedHashBuffer = scryptSync(
    String(password),
    salt,
    storedHashBuffer.length
  );

  if (
    storedHashBuffer.length !== suppliedHashBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    storedHashBuffer,
    suppliedHashBuffer
  );
}