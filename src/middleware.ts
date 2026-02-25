import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  
  /*
  const user = req.cookies.get("userId");

  if (!user) {
    return NextResponse.redirect(new URL("/loggin", req.url));
  }*/

  

  // JWT-Token im Cookie

   const token = req.cookies.get("authtoken")?.value;

  if(!token)
  {
    return NextResponse.redirect(new URL("/loggin", req.url));
  }

   try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next(); // alles gut
  }
  catch (err) {
    return NextResponse.redirect(new URL("/loggin", req.url));
  }

  
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
