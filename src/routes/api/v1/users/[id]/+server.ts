import { error, json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { getCurrentUser } from "$lib/server/auth";
import { getHashedPassword } from "$lib/server/auth";

export const GET: RequestHandler = async ({ params }) => {
  const raw = params.id;
  const asNumber = Number(raw);
  let user = null;
  if (!isNaN(asNumber)) {
    user = await prisma.user.findUnique({ where: { id: asNumber } });
  }
  if (!user) {
    const userByName = await prisma.user.findUnique({
      where: { username: raw },
    });
    if (userByName) {
      return json(
        {
          id: userByName.id,
          username: userByName.username,
          createdAt: userByName.createdAt,
          role: userByName.role,
        },
        { status: 200 },
      );
    }
  }
  if (!user) {
    return json({ message: "User not found" }, { status: 404 });
  }
  return json(
    {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    },
    { status: 200 },
  );
};

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  const localUser = locals.user;
  if (!localUser) {
    throw error(401, "Unauthorized");
  }
  const targetUserId = Number(params.id);
  const body = await request.json();
  const isAdmin = localUser.role === "ADMIN";
  const isSelf = localUser.id === targetUserId;
  if (!isAdmin) {
    throw error(403, "Forbidden");
  }
  if (isSelf && body.role && body.role !== localUser.role) {
    throw error(403, "Admins cannot change their own role");
  }
  let data: any = {};
  if (body.username) {
    data.username = body.username;
  }
  if (body.email) {
    data.email = body.email;
  }
  if (body.password) {
    data.password = await getHashedPassword(body.password);
  }
  if (!isSelf && body.role) {
    if (["ADMIN", "REGULAR"].includes(body.role)) {
      data.role = body.role;
    }
  }
  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data,
  });
  return json({ success: true, user: updated });
};
