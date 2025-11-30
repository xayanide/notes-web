import { json, type RequestHandler } from "@sveltejs/kit";
import { getCurrentUser } from "$lib/server/auth";

export const GET: RequestHandler = async ({ request }) => {
  const user = await getCurrentUser(request);
  if (!user) {
    return json(null, { status: 401 });
  }
  return json(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    { status: 200 },
  );
};
