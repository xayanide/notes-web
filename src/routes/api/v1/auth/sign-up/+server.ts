import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { registerSchema } from "$lib/server/validators";
import { getHashedPassword } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        return new Response(JSON.stringify({ error: parsed.error.message }), { status: 400 });
    }
    const { username, email, password } = parsed.data;
    try {
        const hashed = await getHashedPassword(password);
        const user = await prisma.user.create({ data: { username, email, password: hashed } });
        return new Response(
            JSON.stringify({ id: user.id, username: user.username, email: user.email }),
            { status: 201 },
        );
    } catch {
        return new Response(JSON.stringify({ error: "User exists or invalid data" }), {
            status: 400,
        });
    }
};
