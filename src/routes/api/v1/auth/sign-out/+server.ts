import { json, type RequestHandler } from "@sveltejs/kit";
import * as cookie from "cookie";
import { getClearTokenHeaders } from "$lib/server/authTokens";
import { revokeRefreshToken } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const refreshToken = cookies.refresh_token;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  const headers = getClearTokenHeaders();
  return json({ message: "logged out" }, { status: 200, headers });
};
