import { json, type RequestHandler } from "@sveltejs/kit";
import { getHashedPassword, verifyPassword } from "$lib/server/auth";
import { prisma } from "$lib/server/database";
import { changePasswordSchema } from "$lib/validators";

export const POST: RequestHandler = async ({ request, locals }) => {
  const localUser = locals.user;
  if (!localUser) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const parsed = changePasswordSchema.safeParse({
    oldPassword: formData.get("oldPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return json({ error: "Invalid current or new password format" }, { status: 400 });
  }
  const { oldPassword, newPassword } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: localUser.id },
  });
  if (!user) {
    return json({ error: "User doesn't exist" }, { status: 400 });
  }
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
