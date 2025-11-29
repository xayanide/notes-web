import { type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");
  if (!accessToken) {
    const res = await event.fetch("/api/v1/auth/refresh", { method: "POST" });
    if (!res.ok) {
      return resolve(event);
    }
  }
  return resolve(event);
};
