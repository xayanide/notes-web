import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { loginSchema } from "$lib/server/validators";
import { verifyPassword, createAccessToken, createRefreshToken } from "$lib/server/auth";
import * as cookie from "cookie";

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.message }), { status: 400 });

  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({ where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] } });
  if (!user) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

  const ok = await verifyPassword(user.password, password);
  if (!ok) return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });

  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  const accessMaxAge = 15 * 60; // 15m in seconds; align with ACCESS_TOKEN_EXPIRES
  const refreshMaxAge = 7 * 24 * 60 * 60;

  const headers = {
    "Set-Cookie": [
      cookie.serialize("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge
      }),
      cookie.serialize("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshMaxAge
      })
    ]
  };

  return new Response(JSON.stringify({ message: "ok" }), { status: 200, headers });
};
