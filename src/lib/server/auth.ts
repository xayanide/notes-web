import { randomUUID } from "crypto";
import { prisma } from "./database";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../generated/prisma/client";
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "$env/static/private";
import { ACCESS_SECRET, REFRESH_SECRET } from "./jwtSecrets";

export const ACCESS_EXPIRES_SECONDS = parseDurationToSeconds(ACCESS_TOKEN_EXPIRES || "15m");
export const REFRESH_EXPIRES_SECONDS = parseDurationToSeconds(REFRESH_TOKEN_EXPIRES || "7d");

export async function getHashedPassword(password: string) {
  // argon2id is used by default in many argon2 packages; adjust options for your hardware
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hashedPassword: string, password: string) {
  return argon2.verify(hashedPassword, password);
}

function parseDurationToSeconds(s: string) {
  // simple parser: "15m", "7d", "3600s"
  if (s.endsWith("m")) {
    return parseInt(s.slice(0, -1), 10) * 60;
  }
  if (s.endsWith("h")) {
    return parseInt(s.slice(0, -1), 10) * 3600;
  }
  if (s.endsWith("d")) {
    return parseInt(s.slice(0, -1), 10) * 86400;
  }
  if (s.endsWith("s")) {
    return parseInt(s.slice(0, -1), 10);
  }
  return parseInt(s, 10);
}

export async function createAccessToken(user: User) {
  const now = Math.floor(Date.now() / 1000);
  const jwtBuilder = new SignJWT({ userId: user.id, role: user.role });
  jwtBuilder.setProtectedHeader({ alg: "HS256", typ: "JWT" });
  jwtBuilder.setIssuedAt(now);
  jwtBuilder.setExpirationTime(now + ACCESS_EXPIRES_SECONDS);
  const accessToken = await jwtBuilder.sign(ACCESS_SECRET);
  return accessToken;
}

export async function createRefreshToken(user: User) {
  const now = Math.floor(Date.now() / 1000);
  const uuid = randomUUID();
  const jwtBuilder = new SignJWT({ jti: uuid, userId: user.id });
  jwtBuilder.setProtectedHeader({ alg: "HS256", typ: "JWT" });
  jwtBuilder.setIssuedAt(now);
  jwtBuilder.setExpirationTime(now + REFRESH_EXPIRES_SECONDS);
  const refreshToken = await jwtBuilder.sign(REFRESH_SECRET);
  // persist token so we can revoke / rotate it
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });
  return refreshToken;
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload;
  } catch {
    return null;
  }
}

// revoke a refresh token by token string
export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// rotate refresh: remove old DB entry and create a brand new token for user
export async function rotateRefreshToken(oldToken: string, user: User) {
  await revokeRefreshToken(oldToken);
  return await createRefreshToken(user);
}
