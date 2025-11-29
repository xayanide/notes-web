import type { Actions } from "@sveltejs/kit";

export const actions: Actions = {
  default: async (event) => {
    const fd = await event.request.formData();
    const identifier = fd.get("identifier");
    const password = fd.get("password");

    const res = await event.fetch("/api/v1/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername: identifier, password })
    });

    if (!res.ok) return { error: "Invalid login" };
    return { success: true };
  }
};
