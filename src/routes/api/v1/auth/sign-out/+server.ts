import { json, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies, revokeRefreshToken } from "$lib/server/auth";

export const POST: RequestHandler = async ({ cookies }) => {
  const refreshToken = cookies.get("refresh_token");
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  deleteCookies(cookies);
  return json(null, { status: 204 });
};
