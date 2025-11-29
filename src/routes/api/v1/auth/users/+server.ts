import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";

export const GET: RequestHandler = async ({ params }) => {
  const id = Number(params.id)
  console.log(id)
  if (!id || isNaN(id)) {
    return new Response(null, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return new Response(null, { status: 404 });
  // expose public profile fields only
  return new Response(JSON.stringify({ id: user.id, username: user.username, createdAt: user.createdAt }), { status: 200 });
};
