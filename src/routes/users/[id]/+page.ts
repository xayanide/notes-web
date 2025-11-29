import type { Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
  const res = await event.fetch("/api/v1/users/" + event.params.id);
  return { user: res.ok ? await res.json() : null };
};
