// src/lib/server/auth.ts
import { randomUUID } from "crypto";
import { prisma } from "./database";
import * as argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../generated/prisma/client";
import {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES,
} from "$env/static/private";

const ACCESS_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET);

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
    const accessToken = new SignJWT({ userId: user.id, role: user.role });
    accessToken.setProtectedHeader({ alg: "HS256", typ: "JWT" });
    accessToken.setIssuedAt(now);
    accessToken.setExpirationTime(now + ACCESS_EXPIRES_SECONDS);
    const signedAccessToken = await accessToken.sign(ACCESS_SECRET);
    return signedAccessToken;
}

export async function createRefreshToken(user: User) {
    const now = Math.floor(Date.now() / 1000);
    const uuid = randomUUID();
    const refreshToken = new SignJWT({ jti: uuid, userId: user.id });
    refreshToken.setProtectedHeader({ alg: "HS256", typ: "JWT" });
    refreshToken.setIssuedAt(now);
    refreshToken.setExpirationTime(now + REFRESH_EXPIRES_SECONDS);
    const signedRefreshToken = await refreshToken.sign(REFRESH_SECRET);
    // persist token so we can revoke / rotate it
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_SECONDS * 1000);
    await prisma.refreshToken.create({
        data: { token: signedRefreshToken, userId: user.id, expiresAt },
    });
    return signedRefreshToken;
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
export async function rotateRefreshToken(oldToken: string, userId: number) {
    await prisma.refreshToken.deleteMany({ where: { token: oldToken } });
    // create new refresh token
    return createRefreshToken({ id: userId });
}
