import { randomUUID } from "crypto";
import { prisma } from "./database";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../generated/prisma/client";
import { ACCESS_TOKEN_EXPIRES, REFRESH_TOKEN_EXPIRES } from "$env/static/private";
import { ACCESS_SECRET, REFRESH_SECRET } from "./jwtSecrets";
import { dev } from "$app/environment";
import * as cookie from "cookie";

export const ACCESS_EXPIRES_SECONDS = parseDurationToSeconds(ACCESS_TOKEN_EXPIRES || "15m");
export const REFRESH_EXPIRES_SECONDS = parseDurationToSeconds(REFRESH_TOKEN_EXPIRES || "7d");

const JWT_PROTECTED_HEADERS = { alg: "HS256", typ: "JWT" };

type AccessTokenPayload = {
  userId: number;
  role: string;
  iat: number;
  exp: number;
};

type RefreshTokenPayload = {
  userId: number;
  jti: string;
  iat: number;
  exp: number;
};

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
  jwtBuilder.setProtectedHeader(JWT_PROTECTED_HEADERS);
  jwtBuilder.setIssuedAt(now);
  jwtBuilder.setExpirationTime(now + ACCESS_EXPIRES_SECONDS);
  const accessToken = await jwtBuilder.sign(ACCESS_SECRET);
  return accessToken;
}

export async function createRefreshToken(user: User) {
  const now = Math.floor(Date.now() / 1000);
  const uuid = randomUUID();
  const jwtBuilder = new SignJWT({ userId: user.id, jti: uuid });
  jwtBuilder.setProtectedHeader(JWT_PROTECTED_HEADERS);
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
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as RefreshTokenPayload;
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

export function getNewTokenHeaders(accessToken: string, refreshToken: string) {
  const isProduction = dev === false;
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookie.serialize("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_EXPIRES_SECONDS,
    }),
  );
  headers.append(
    "Set-Cookie",
    cookie.serialize("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_EXPIRES_SECONDS,
    }),
  );
  return headers;
}

export function getClearTokenHeaders() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookie.serialize("access_token", "", { httpOnly: true, path: "/", maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    cookie.serialize("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 }),
  );
  return headers;
}

export async function getCurrentUser(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const accessToken = cookies.access_token;
  if (!accessToken) {
    return null;
  }
  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user;
}
