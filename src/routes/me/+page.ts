import type { Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
  const res = await event.fetch("/api/v1/auth/me");
  if (res.ok) return { user: await res.json() };
  return { user: null };
};
