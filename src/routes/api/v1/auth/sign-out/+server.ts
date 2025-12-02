import { json, type RequestHandler } from "@sveltejs/kit";
import { deleteCookies, revokeRefreshToken } from "$lib/server/auth";

export const POST: RequestHandler = async ({ cookies, locals }) => {
  const localUser = locals.user;
  const refreshToken = cookies.get("refresh_token");
  if (!refreshToken || !localUser) {
    deleteCookies(cookies);
    return json({ message: "You were not signed in" }, { status: 200 });
  }
  await revokeRefreshToken(refreshToken);
  deleteCookies(cookies);
  return json({ message: "Signed out successfully" }, { status: 200 });
};
