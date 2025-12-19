import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  
  const user = req.cookies.get("userId");

  if (!user) {
    return NextResponse.redirect(new URL("/loggin", req.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/settings/:path*",
    "/home/:path*",
    "/likes/:path*",
    "/chat/:path*",
    "/likes/:path*",
    "/profile_edit/:path*"
  ],
};
