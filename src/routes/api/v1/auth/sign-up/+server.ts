import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { registerSchema } from "$lib/server/validators";
import { getHashedPassword } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
        return json({ error: parsed.error.message }, { status: 400 });
    }
    const { username, email, password } = parsed.data;
    try {
        // Check if username or email is already taken
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });
        if (existingUser) {
            if (existingUser.username === username) {
                return json(
                    { error: "Username is already taken" },
                    {
                        status: 409,
                    },
                );
            }
            if (existingUser.email === email) {
                return json(
                    { error: "Email is already taken" },
                    {
                        status: 409,
                    },
                );
            }
        }
        const hashed = await getHashedPassword(password);
        const user = await prisma.user.create({ data: { username, email, password: hashed } });
        return json(
            { id: user.id, username: user.username, email: user.email },
            {
                status: 201,
            },
        );
    } catch {
        return json(
            { error: "User exists or invalid data" },
            {
                status: 400,
            },
        );
    }
};
