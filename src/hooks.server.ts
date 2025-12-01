import { getCurrentUser, refreshAccessToken } from "$lib/server/auth";

export const handle = async ({ event, resolve }) => {
  const request = event.request;
  const user = await getCurrentUser(request);
  if (user) {
    event.locals.user = user;
    return await resolve(event);
  }
  const refreshed = await refreshAccessToken(request);
  if (!refreshed) {
    return await resolve(event);
  }
  event.locals.user = refreshed.user;
  const response = await resolve(event);
  const refreshHeaders = refreshed.headers.get("Set-Cookie");
  if (refreshHeaders) {
    response.headers.set("Set-Cookie", refreshHeaders);
  }
  return response;
};
