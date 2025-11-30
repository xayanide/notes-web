import { type Handle } from "@sveltejs/kit";
import * as cookie from "cookie";

export const handle: Handle = async ({ event, resolve }) => {
  const cookies = cookie.parse(event.request.headers.get("cookie") || "");
  const accessToken = cookies.access_token;
  if (!accessToken) {
    const res = await event.fetch("/api/v1/auth/refresh", { method: "POST" });
    if (!res.ok) {
      return resolve(event);
    }
  }
  return resolve(event);
};
