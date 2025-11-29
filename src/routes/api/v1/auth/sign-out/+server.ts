import type { RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";
import { prisma } from "$lib/server/database";

export const POST: RequestHandler = async ({ request }) => {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const refresh = cookies.refresh_token;
  if (refresh) {
    await prisma.refreshToken.deleteMany({ where: { token: refresh } });
  }

  const headers = {
    "Set-Cookie": [
      cookie.serialize("access_token", "", { httpOnly: true, path: "/", maxAge: 0 }),
      cookie.serialize("refresh_token", "", { httpOnly: true, path: "/", maxAge: 0 })
    ]
  };

  return new Response(JSON.stringify({ message: "logged out" }), { status: 200, headers });
};
