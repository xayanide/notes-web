import type { Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
    const res = await event.fetch("/api/v1/users/" + event.params.id);
    const userData = res.ok ? await res.json() : null
    return { user: res.ok ? { id: userData.id, username: userData.username } : null };
};
