import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { signInSchema } from "$lib/validators";
import {
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setNewCookies,
} from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  const localUser = locals.user;
  if (localUser) {
    return json({ message: "Already signed in" }, { status: 200 });
  }
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    emailOrUsername: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return json({ error: "Invalid identifier or password format" }, { status: 400 });
  }
  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }
  const success = await verifyPassword(user.password, password);
  if (!success) {
    return json({ error: "Incorrect password" }, { status: 401 });
  }
  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  setNewCookies(cookies, accessToken, refreshToken);
  return json({ message: "Signed in successfully" }, { status: 200 });
};
