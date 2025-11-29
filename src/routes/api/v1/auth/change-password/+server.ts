import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { getHashedPassword, verifyPassword } from "$lib/server/auth";
import { changePasswordSchema } from "$lib/server/validators";
import { getCurrentUser } from "$lib/server/getCurrentUser";
import { z } from "zod";

export const POST: RequestHandler = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return json(null, { status: 401 });
  }
  const fd = Object.fromEntries(await request.formData());
  const parsed = changePasswordSchema.safeParse(fd);
  if (!parsed.success) {
    return json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }
  const { oldPassword, newPassword } = parsed.data;
  const ok = await verifyPassword(user.password, oldPassword);
  if (!ok) {
    return json({ error: "Incorrect current password" }, { status: 400 });
  }
  const hashedPassword = await getHashedPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  return json({ message: "Password changed successfully" }, { status: 200 });
};
