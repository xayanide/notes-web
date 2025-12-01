import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { getHashedPassword, verifyPassword } from "$lib/server/auth";
import { changePasswordSchema } from "$lib/validators";

export const POST: RequestHandler = async ({ request, locals }) => {
  const localUser = locals.user;
  if (!localUser) {
    return json("Unauthorized", { status: 401 });
  }
  const fd = Object.fromEntries(await request.formData());
  const parsed = changePasswordSchema.safeParse(fd);
  if (!parsed.success) {
    return json({ error: "Invalid current or new password" }, { status: 400 });
  }
  const { oldPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: localUser.id } });
  if (!user) {
    return json({ error: "User doesn't exist" }, { status: 400 });
  }
  const ok = await verifyPassword(user.password, oldPassword);
  if (!ok) {
    return json({ error: "Incorrect password" }, { status: 400 });
  }
  const hashedPassword = await getHashedPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  return json({ message: "Password changed successfully" }, { status: 200 });
};
