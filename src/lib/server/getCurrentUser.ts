// src/lib/server/getCurrentUser.ts
import * as cookie from "cookie";
import { prisma } from "./database.ts";
import { verifyAccessToken } from "$lib/server/auth";

export async function getCurrentUser(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const access = cookies.access_token;
  if (!access) return null;
  const payload = await verifyAccessToken(access);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: (payload as any).userId } });
  return user;
}
