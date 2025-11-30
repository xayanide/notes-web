import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "$env/static/private";

const textEncoder = new TextEncoder();

export const ACCESS_SECRET = textEncoder.encode(JWT_ACCESS_SECRET);
export const REFRESH_SECRET = textEncoder.encode(JWT_REFRESH_SECRET);
