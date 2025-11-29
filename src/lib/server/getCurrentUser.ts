import * as cookie from "cookie";
import { prisma } from "./database.ts";
import { verifyAccessToken } from "$lib/server/auth";

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
  const user = await prisma.user.findUnique({ where: { id: (payload as any).userId } });
  return user;
}
