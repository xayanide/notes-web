import type { Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
    const res = await event.fetch("/api/v1/me");
    if (!res.ok) {
        return { user: null };
    }
    return { user: await res.json() };
};
