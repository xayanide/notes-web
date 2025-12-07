import { getCurrentUserOrRefresh } from "$lib/server/auth";

export const handle = async ({ event, resolve }) => {
  const user = await getCurrentUserOrRefresh(event.cookies);
  event.locals.user = user ?? undefined;
  return await resolve(event);
};
