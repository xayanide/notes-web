import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";

export const GET: RequestHandler = async ({ params }) => {
    const id = Number(params.id);
    console.log(id);
    if (!id || isNaN(id)) {
        return json(null, { status: 404 });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return json(null, { status: 404 });
    }
    // expose public profile fields only
    return json(
        { id: user.id, username: user.username, createdAt: user.createdAt },
        { status: 200 },
    );
};
