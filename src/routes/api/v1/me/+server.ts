import type { RequestHandler } from "@sveltejs/kit";
import { getCurrentUser } from "$lib/server/getCurrentUser";

export const GET: RequestHandler = async ({ request }) => {
    const user = await getCurrentUser(request);
    if (!user) {
        return new Response(null, { status: 401 });
    }
    return new Response(
        JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        }),
        { status: 200 },
    );
};
