import { json, type RequestHandler } from "@sveltejs/kit";
import { prisma } from "$lib/server/database";
import { signUpSchema } from "$lib/validators";
import { getHashedPassword } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const parsed = signUpSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return json({ error: "Invalid username, email, or password format" }, { status: 400 });
  }
  const { username, email, password } = parsed.data;
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  if (existingUser && existingUser.username === username) {
    return json(
      { error: `Username "${username}" is already taken` },
      {
        status: 409,
      },
    );
  }
  if (existingUser && existingUser.email === email) {
    return json(
      { error: `Email "${email}" is already in use` },
      {
        status: 409,
      },
    );
  }
  const hashedPassword = await getHashedPassword(password);
  await prisma.user.create({ data: { username, email, password: hashedPassword } });
  return json({ message: "Signed up successfully" }, { status: 201 });
};
