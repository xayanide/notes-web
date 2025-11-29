import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";

export const GET: RequestHandler = async ({ params }) => {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return new Response(null, { status: 404 });

  // expose public profile fields only
  return new Response(JSON.stringify({ id: user.id, username: user.username, createdAt: user.createdAt }), { status: 200 });
};
