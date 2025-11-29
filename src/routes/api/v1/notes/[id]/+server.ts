import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { noteSchema } from "$lib/server/validators";
import { getCurrentUser } from "$lib/server/getCurrentUser";

export const GET: RequestHandler = async ({ params, request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return json(null, { status: 401 });
  }
  const note = await prisma.note.findUnique({ where: { id: Number(params.id) } });
  if (!note || note.userId !== user.id) {
    return json(null, { status: 404 });
  }
  return json(note, { status: 200 });
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return json(null, { status: 401 });
  }
  const note = await prisma.note.findUnique({ where: { id: Number(params.id) } });
  if (!note || note.userId !== user.id) {
    return json(null, { status: 404 });
  }
  const body = await request.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.message }, { status: 400 });
  }
  const updated = await prisma.note.update({
    where: { id: Number(params.id) },
    data: parsed.data,
  });
  return json(updated, { status: 200 });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return json(null, { status: 401 });
  }
  const note = await prisma.note.findUnique({ where: { id: Number(params.id) } });
  if (!note || note.userId !== user.id) {
    return json(null, { status: 404 });
  }
  await prisma.note.delete({ where: { id: Number(params.id) } });
  return new Response(null, { status: 204 });
};
