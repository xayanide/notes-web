import { getCurrentUser } from "$lib/server/getCurrentUser";
import { prisma } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "ADMIN") {
    throw error(403, "Forbidden");
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });
  return { users };
};
