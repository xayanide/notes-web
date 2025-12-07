// hybrid stateful jwt based session system
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
  IS_LAN,
} from "$env/static/private";
import { dev } from "$app/environment";
import parseDuration from "parse-duration";
import type { Cookies, RequestEvent } from "@sveltejs/kit";

const IS_LAN_PRODUCTION = Boolean(IS_LAN ?? false);
const IS_WEB_PRODUCTION = dev === false && IS_LAN_PRODUCTION === false;

const textEncoder = new TextEncoder();

const ACCESS_SECRET_KEY = textEncoder.encode(JWT_ACCESS_SECRET);
const REFRESH_SECRET_KEY = textEncoder.encode(JWT_REFRESH_SECRET);

// this is the preferred way of doing it. the consequence in development is
// when changing values of .env on these, hot reloads will not reflect the current values
const ACCESS_EXPIRES_SECONDS = (parseDuration(ACCESS_TOKEN_EXPIRES || "15m") ?? 900) / 1000;
const REFRESH_EXPIRES_SECONDS = (parseDuration(REFRESH_TOKEN_EXPIRES || "7d") ?? 604800) / 1000;

const JWT_PROTECTED_HEADERS = { alg: "HS256", typ: "JWT" };

type AccessTokenPayload = {
  userId: number;
  userRole: string;
  userStatus: string;
  // a basic solution, nothing crazy but deviates from jwt's supposed stateless nature,
  // this is used to invalidate old access tokens when the user revokes all sessions, one of the big flaws of JWT
  // which is access token invalidation
  version: number;
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
  return await argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hashedPassword: string, password: string) {
  return await argon2.verify(hashedPassword, password);
}

export async function getNewAccessToken(user: User) {
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const jwtBuilder = new SignJWT({
    userId: user.id,
    userRole: user.role,
    userStatus: user.status,
    version: user.accessTokenVersion,
  });
  jwtBuilder.setProtectedHeader(JWT_PROTECTED_HEADERS);
  jwtBuilder.setIssuedAt(nowSec);
  jwtBuilder.setExpirationTime(nowSec + ACCESS_EXPIRES_SECONDS);
  return await jwtBuilder.sign(ACCESS_SECRET_KEY);
}

export async function getNewRefreshToken(user: User) {
  const nowMs = Date.now();
  const nowSec = Math.floor(nowMs / 1000);
  const uuid = nodeCrypto.randomUUID();
  const userId = user.id;
  const jwtBuilder = new SignJWT({ userId, jti: uuid });
  jwtBuilder.setProtectedHeader(JWT_PROTECTED_HEADERS);
  jwtBuilder.setIssuedAt(nowSec);
  jwtBuilder.setExpirationTime(nowSec + REFRESH_EXPIRES_SECONDS);
  const refreshToken = await jwtBuilder.sign(REFRESH_SECRET_KEY);
  const expiresAt = new Date(nowMs + REFRESH_EXPIRES_SECONDS * 1000);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });
  return refreshToken;
}

export async function getAccessTokenPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET_KEY);
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function getRefreshTokenPayload(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET_KEY);
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export async function revokeRefreshToken(token: string) {
  return await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function revokeAllTokens(userId: number) {
  await prisma.user.update({
    where: { id: userId },
    data: { accessTokenVersion: { increment: 1 } },
  });
  return await prisma.refreshToken.deleteMany({ where: { userId } });
}

export async function getNextRefreshToken(user: User, token: string) {
  await revokeRefreshToken(token);
  return await getNewRefreshToken(user);
}

export function setSessionCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
  cookies.set("access_token", accessToken, {
    path: "/",
    httpOnly: true,
    secure: IS_WEB_PRODUCTION,
    sameSite: "lax",
    maxAge: ACCESS_EXPIRES_SECONDS,
  });
  cookies.set("refresh_token", refreshToken, {
    path: "/",
    httpOnly: true,
    secure: IS_WEB_PRODUCTION,
    sameSite: "lax",
    maxAge: REFRESH_EXPIRES_SECONDS,
  });
}

export function deleteSessionCookies(cookies: Cookies) {
  cookies.delete("access_token", {
    httpOnly: true,
    secure: IS_WEB_PRODUCTION,
    sameSite: "lax",
    path: "/",
  });
  cookies.delete("refresh_token", {
    httpOnly: true,
    secure: IS_WEB_PRODUCTION,
    sameSite: "lax",
    path: "/",
  });
}

export function getNewSessionHeaders(cookies: Cookies, accessToken: string, refreshToken: string) {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookies.serialize("access_token", accessToken, {
      httpOnly: true,
      secure: IS_WEB_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_EXPIRES_SECONDS,
    }),
  );
  headers.append(
    "Set-Cookie",
    cookies.serialize("refresh_token", refreshToken, {
      httpOnly: true,
      secure: IS_WEB_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_EXPIRES_SECONDS,
    }),
  );
  return headers;
}

export function getDeleteSessionHeaders(cookies: Cookies) {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookies.serialize("access_token", "", {
      httpOnly: true,
      secure: IS_WEB_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }),
  );
  headers.append(
    "Set-Cookie",
    cookies.serialize("refresh_token", "", {
      httpOnly: true,
      secure: IS_WEB_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }),
  );
  return headers;
}

export async function signInUser(user: User, cookies: Cookies) {
  const accessToken = await getNewAccessToken(user);
  const refreshToken = await getNewRefreshToken(user);
  setSessionCookies(cookies, accessToken, refreshToken);
}

export async function getCurrentUserOrRefresh(cookies: Cookies) {
  const accessToken = cookies.get("access_token");
  if (accessToken) {
    const accessTokenPayload = await getAccessTokenPayload(accessToken);
    if (accessTokenPayload) {
      const user = await prisma.user.findUnique({ where: { id: accessTokenPayload.userId } });
      if (
        user &&
        accessTokenPayload.version === user.accessTokenVersion &&
        !["PENDING", "INACTIVE", "BANNED"].includes(user.status)
      ) {
        return getSanitizedUser(user);
      }
    }
  }
  const refreshToken = cookies.get("refresh_token");
  if (!refreshToken) {
    return null;
  }
  const refreshTokenPayload = await getRefreshTokenPayload(refreshToken);
  if (!refreshTokenPayload) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (refreshTokenPayload.exp <= now) {
    return null;
  }
  const result = await prisma.$transaction(async (tx) => {
    const tokenRow = await tx.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (
      !tokenRow ||
      tokenRow.expiresAt.getTime() <= Date.now() ||
      ["PENDING", "INACTIVE", "BANNED"].includes(tokenRow.user.status)
    ) {
      return null;
    }
    const newRefreshToken = await getNextRefreshToken(tokenRow.user, refreshToken);
    const newAccessToken = await getNewAccessToken(tokenRow.user);
    setSessionCookies(cookies, newAccessToken, newRefreshToken);
    return getSanitizedUser(tokenRow.user);
  });
  return result;
}

export function getSanitizedUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export function onSiginInRedirect(
  event: RequestEvent,
  message: string = "You must be signed in to access this page",
) {
  const eventUrl = event.url;
  const redirectTo = `${eventUrl.pathname}${eventUrl.search}`;
  return `/sign-in?redirectTo=${redirectTo}&message=${message}`;
}

export function redirectTest(event: RequestEvent) {
  const redirectTo = event.url.searchParams.get("redirectTo") || "";
  return `/${redirectTo.slice(1)}`;
}
