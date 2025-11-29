import { JWT_ACCESS_SECRET } from "$env/static/private";
import type { Handle } from "@sveltejs/kit";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);

export const handle: Handle = async ({ event, resolve }) => {
    const auth = event.request.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
        // remove "Bearer "
        const accessToken = auth.slice(7);
        try {
            const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
            event.locals.user = { id: payload.sub };
        } catch {
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }
    return await resolve(event);
};
