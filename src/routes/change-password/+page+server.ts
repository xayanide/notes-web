import type { Actions, Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
    const me = await event.fetch("/api/v1/me");
    return { user: me.ok ? await me.json() : null };
};

export const actions: Actions = {
    default: async (event) => {
        const fd = await event.request.formData();
        const res = await event.fetch("/api/v1/auth/change-password", {
            method: "POST",
            body: fd,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            return { error: data?.error ?? "Failed to update password" };
        }
        return { success: data?.message ?? "Password updated" };
    },
};
