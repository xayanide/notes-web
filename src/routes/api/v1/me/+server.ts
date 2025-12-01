import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  const localUser = locals.user;
  if (!localUser) {
    return json("Unauthorized", { status: 401 });
  }
  return json(localUser, { status: 200 });
};
