import { getCurrentUser } from "$lib/server/auth";
import { prisma } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load = async ({ params, request }) => {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "ADMIN") {
    throw error(403, "Forbidden");
  }
  const target = await prisma.user.findUnique({ where: { id: Number(params.id) } });
  if (!target) {
    throw error(404, "User not found");
  }
  return { target, isSelf: user.id === target.id };
};
