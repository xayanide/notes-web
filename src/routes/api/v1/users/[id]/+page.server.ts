import { prisma } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load = async ({ params, locals }) => {
  const localUser = locals.user;
  if (!localUser) {
    throw error(401, "Unauthorized");
  }
  if (!localUser || localUser.role !== "ADMIN") {
    throw error(403, "Forbidden");
  }
  const target = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!target) {
    throw error(404, "User not found");
  }
  return { target, isSelf: localUser.id === target.id };
};
