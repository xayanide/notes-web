import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { signInSchema } from "$lib/validators";
import {
  verifyPassword,
  setSessionCookies,
  getNewAccessToken,
  getNewRefreshToken,
} from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  const localUser = locals.user;
  if (localUser) {
    return json({ message: "User already signed in" }, { status: 200 });
  }
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    emailOrUsername: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return json({ error: "Invalid identifier or password format", formData }, { status: 400 });
  }
  const { emailOrUsername, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }
  const isPasswordCorrect = await verifyPassword(user.password, password);
  if (!isPasswordCorrect) {
    return json({ error: "Incorrect password" }, { status: 401 });
  }
  const userStatus = user.status;
  if (userStatus === "PENDING") {
    return json({ error: "User currently pending for confirmation" }, { status: 403 });
  }
  if (userStatus === "INACTIVE") {
    return json({ error: "User currently inactive" }, { status: 403 });
  }
  if (userStatus === "BANNED") {
    return json({ error: "User currently banned" }, { status: 403 });
  }
  const accessToken = await getNewAccessToken(user);
  const refreshToken = await getNewRefreshToken(user);
  setSessionCookies(cookies, accessToken, refreshToken);
  return json({ message: "Signed in successfully" }, { status: 200 });
};
