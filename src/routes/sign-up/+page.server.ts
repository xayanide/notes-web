import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
    default: async (event) => {
        const fd = await event.request.formData();
        const username = fd.get("username");
        const email = fd.get("email");
        const password = fd.get("password");
        const res = await event.fetch("/api/v1/auth/sign-up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });
        if (!res.ok) {
            return { error: "Sign-up failed" };
        }
        return { success: true };
    },
};
