import type { Actions, Load } from "@sveltejs/kit";

export const load: Load = async (event) => {
    const res = await event.fetch("/api/v1/notes");
    if (!res.ok) {
        return { notes: [], error: "Not signed in" };
    }
    return { notes: await res.json() };
};

export const actions: Actions = {
    default: async (event) => {
        const fd = await event.request.formData();
        const action = fd.get("action") as string;
        const id = fd.get("id");
        const title = fd.get("title");
        const content = fd.get("content");
        if (!action) {
            await event.fetch("/api/v1/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });
            return;
        }
        if (action === "update") {
            await event.fetch("/api/v1/notes/" + id, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content }),
            });
            return;
        }
        if (action === "delete") {
            await event.fetch("/api/v1/notes/" + id, { method: "DELETE" });
            return;
        }
    },
};
