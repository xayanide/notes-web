import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { signInSchema } from "$lib/server/validators";
import {
    verifyPassword,
    createAccessToken,
    createRefreshToken,
    ACCESS_EXPIRES_SECONDS,
    REFRESH_EXPIRES_SECONDS,
} from "$lib/server/auth";
import * as cookie from "cookie";
import { getCurrentUser } from "$lib/server/getCurrentUser";

export const POST: RequestHandler = async ({ request }) => {
    const currentUser = await getCurrentUser(request);
    if (currentUser) {
        return json({ error: "Already signed in" }, { status: 400 });
    }
    const body = await request.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
        return json({ error: parsed.error.message }, { status: 400 });
    }
    const { emailOrUsername, password } = parsed.data;
    const user = await prisma.user.findFirst({
        where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    });
    if (!user) {
        return json({ error: "Invalid identifier" }, { status: 401 });
    }
    const success = await verifyPassword(user.password, password);
    if (!success) {
        return json({ error: "Invalid password" }, { status: 401 });
    }
    const accessToken = await createAccessToken(user);
    const refreshToken = await createRefreshToken(user);
    const accessMaxAge = ACCESS_EXPIRES_SECONDS; // 15m in seconds; align with ACCESS_TOKEN_EXPIRES
    const refreshMaxAge = REFRESH_EXPIRES_SECONDS;
    const headers = {
        "Set-Cookie": [
            cookie.serialize("access_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: accessMaxAge,
            }),
            cookie.serialize("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: refreshMaxAge,
            }),
        ],
    };
    return json({ message: "ok" }, { status: 200, headers });
};
