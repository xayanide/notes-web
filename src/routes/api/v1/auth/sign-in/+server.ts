import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { signInSchema } from "$lib/validators";
import { verifyPassword, createAccessToken, createRefreshToken } from "$lib/server/auth";
import { getNewTokenHeaders } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  const localUser = locals.user;
  if (localUser) {
    return json({ message: "Already signed in" }, { status: 200 });
  }
  const body = await request.json();
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: parsed.error.message }, { status: 400 });
  }
  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });
  if (!user) {
    return json({ error: "User doesn't exist" }, { status: 401 });
  }
  const success = await verifyPassword(user.password, password);
  if (!success) {
    return json({ error: "Incorrect password" }, { status: 401 });
  }
  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);
  const headers = getNewTokenHeaders(cookies, accessToken, refreshToken);
  return json({ message: "ok" }, { status: 200, headers });
};
