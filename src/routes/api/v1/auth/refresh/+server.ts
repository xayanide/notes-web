import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import * as cookie from "cookie";
import { verifyRefreshToken, createRefreshToken, createAccessToken } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
    const cookies = cookie.parse(request.headers.get("cookie") || "");
    const refresh = cookies.refresh_token;
    if (!refresh) {
        return new Response(null, { status: 401 });
    }
    const payload = await verifyRefreshToken(refresh);
    if (!payload) {
        return new Response(null, { status: 401 });
    }
    // check DB presence and expiry
    const tokenRow = await prisma.refreshToken.findUnique({ where: { token: refresh } });
    if (!tokenRow || tokenRow.expiresAt < new Date()) {
        return new Response(null, { status: 401 });
    }
    // rotate: delete old token, issue new refresh token and new access token
    await prisma.refreshToken.deleteMany({ where: { token: refresh } });
    const user = await prisma.user.findUnique({ where: { id: (payload as any).userId } });
    if (!user) {
        return new Response(null, { status: 401 });
    }
    const newRefresh = await createRefreshToken(user); // createRefreshToken persists it
    const newAccess = await createAccessToken(user);
    const headers = {
        "Set-Cookie": [
            cookie.serialize("access_token", newAccess, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60,
            }),
            cookie.serialize("refresh_token", newRefresh, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 7 * 24 * 60 * 60,
            }),
        ],
    };
    return new Response(JSON.stringify({ message: "refreshed" }), { status: 200, headers });
};
