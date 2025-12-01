import { prisma } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
  const localUser = locals.user;
  if (!localUser || localUser.role !== "ADMIN") {
    throw error(403, "Forbidden");
  }
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true, email: true, role: true, createdAt: true },
  });
  return { users };
};
