import { json, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";

export const GET: RequestHandler = () => {
  const headers = new Headers();
  headers.set("Location", "/sign-in");
  headers.append("Set-Cookie", cookie.serialize("access_token", "", { maxAge: 0, path: "/" }));
  headers.append("Set-Cookie", cookie.serialize("refresh_token", "", { maxAge: 0, path: "/" }));
  return json(null, { status: 302, headers });
};
