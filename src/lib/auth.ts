import { jwtVerify } from "jose";

const tokenCookieName = "authtoken";

function getCookieValue(cookieHeader: string | null, name: string) {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie?.slice(name.length + 1);
}

export async function getAuthenticatedUserId(request: Request) {
  const token = getCookieValue(
    request.headers.get("cookie"),
    tokenCookieName,
  );
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.userId === "string" ? payload.userId : null;
  } catch {
    return null;
  }
}
