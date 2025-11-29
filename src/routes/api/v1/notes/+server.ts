import type { RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { noteSchema } from "$lib/server/validators";
import { getCurrentUser } from "$lib/server/getCurrentUser";

export const POST: RequestHandler = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) return new Response(null, { status: 401 });

  const body = await request.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return new Response(JSON.stringify({ error: parsed.error.message }), { status: 400 });

  const note = await prisma.note.create({ data: { ...parsed.data, userId: user.id } });
  return new Response(JSON.stringify(note), { status: 201 });
};

export const GET: RequestHandler = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) return new Response(null, { status: 401 });

  const notes = await prisma.note.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return new Response(JSON.stringify(notes), { status: 200 });
};
