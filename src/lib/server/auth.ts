// src/lib/server/auth.ts
import { randomUUID } from "crypto";
import { prisma } from "./database";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../generated/prisma/client";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

export async function hashPassword(password: string) {
  // argon2id is used by default in many argon2 packages; adjust options for your hardware
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

function parseDurationToSeconds(s: string) {
  // simple parser: "15m", "7d", "3600s"
  if (s.endsWith("m")) return parseInt(s.slice(0, -1), 10) * 60;
  if (s.endsWith("h")) return parseInt(s.slice(0, -1), 10) * 3600;
  if (s.endsWith("d")) return parseInt(s.slice(0, -1), 10) * 86400;
  if (s.endsWith("s")) return parseInt(s.slice(0, -1), 10);
  return parseInt(s, 10);
}

export async function createAccessToken(user: User) {
  const expiresInSec = parseDurationToSeconds(ACCESS_EXPIRES);
  const now = Math.floor(Date.now() / 1000);

  return await new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSec)
    .sign(ACCESS_SECRET);
}

export async function createRefreshToken(user: User) {
  const expiresInSec = parseDurationToSeconds(REFRESH_EXPIRES);
  const now = Math.floor(Date.now() / 1000);
  const tokenId = randomUUID();

  const token = await new SignJWT({ jti: tokenId, userId: user.id })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSec)
    .sign(REFRESH_SECRET);

  // persist token so we can revoke / rotate it
  const expiresAt = new Date(Date.now() + expiresInSec * 1000);
  await prisma.refreshToken.create({
    data: { token, userId: user.id, expiresAt }
  });

  return token;
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as Record<string, any>;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as Record<string, any>;
  } catch {
    return null;
  }
}

// revoke a refresh token by token string
export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// rotate refresh: remove old DB entry and create a brand new token for user
export async function rotateRefreshToken(oldToken: string, userId: string) {
  await prisma.refreshToken.deleteMany({ where: { token: oldToken } });
  // create new refresh token
  return createRefreshToken({ id: userId } as User);
}
