import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authtoken")?.value;
  const secret = process.env.JWT_SECRET;

  const redirectToLogin = () => NextResponse.redirect(new URL("/loggin", req.url));

  if (!token || !secret) return redirectToLogin();

  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);

    // JWT überprüfen
    const { payload } = await jwtVerify(token, key);
    if (typeof payload.userId !== "string") return redirectToLogin();
    
    return NextResponse.next();
  } catch (err) {
    console.log("JWT invalid:", err);
    return redirectToLogin();
  }
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/home/:path*",
    "/likes/:path*",
    "/chat/:path*",
    "/profile_edit/:path*",
  ],
};