import type { Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
  const me = await event.fetch("/api/v1/me");
  return { user: me.ok ? await me.json() : null };
};
