import * as nodeCrypto from "node:crypto";
import { prisma } from "./database";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../generated/prisma/client";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
} from "$env/static/private";
import { dev } from "$app/environment";
import * as cookie from "cookie";
import parseDuration from "parse-duration";

const textEncoder = new TextEncoder();

const ACCESS_SECRET = textEncoder.encode(JWT_ACCESS_SECRET);
const REFRESH_SECRET = textEncoder.encode(JWT_REFRESH_SECRET);

// this is the preferred way of doing it. the consequence in development is
// when changing values of .env on these, hot reloads will not reflect the current values
const ACCESS_EXPIRES_SECONDS = (parseDuration(ACCESS_TOKEN_EXPIRES || "15m") ?? 900) / 1000;
const REFRESH_EXPIRES_SECONDS = (parseDuration(REFRESH_TOKEN_EXPIRES || "7d") ?? 604800) / 1000;

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
  // because argon2id is used by default in many argon2 packages
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hashedPassword: string, password: string) {
  return argon2.verify(hashedPassword, password);
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
  const uuid = nodeCrypto.randomUUID();
  const jwtBuilder = new SignJWT({ userId: user.id, jti: uuid });
  jwtBuilder.setProtectedHeader(JWT_PROTECTED_HEADERS);
  jwtBuilder.setIssuedAt(now);
  jwtBuilder.setExpirationTime(now + REFRESH_EXPIRES_SECONDS);
  const refreshToken = await jwtBuilder.sign(REFRESH_SECRET);
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
  } catch (err) {
    if (err instanceof Error) {
      console.error(`verifyAccessToken(): ${err.message}\n${err.stack}`);
    }
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as RefreshTokenPayload;
  } catch (err) {
    if (err instanceof Error) {
      console.error(`verifyAccessToken(): ${err.message}\n${err.stack}`);
    }
    return null;
  }
}

export async function revokeRefreshToken(token: string) {
  return await prisma.refreshToken.deleteMany({ where: { token } });
}

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
  if (!user) {
    return null;
  }
  return getSanitizedUser(user);
}

export async function refreshAccessToken(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const refreshToken = cookies.refresh_token;
  if (!refreshToken) {
    return null;
  }
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return null;
  }
  const tokenRow = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!tokenRow) {
    return null;
  }
  const isTokenExpired = tokenRow.expiresAt.getTime() <= Date.now();
  if (isTokenExpired) {
    return null;
  }
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return null;
  }
  const newRefreshToken = await rotateRefreshToken(refreshToken, user);
  const newAccessToken = await createAccessToken(user);
  const headers = getNewTokenHeaders(newAccessToken, newRefreshToken);
  return {
    user: getSanitizedUser(user),
    headers,
  };
}

export function getSanitizedUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}
