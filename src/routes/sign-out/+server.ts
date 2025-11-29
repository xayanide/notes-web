import { json, type RequestHandler } from "@sveltejs/kit";
import cookie from "cookie";

export const GET: RequestHandler = () => {
  return json(null, {
    status: 302,
    headers: {
      "Location": "/sign-in",
      "Set-Cookie": [
        cookie.serialize("access_token", "", { maxAge: 0, path: "/" }),
        cookie.serialize("refresh_token", "", { maxAge: 0, path: "/" }),
      ],
    },
  });
};
