import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.name, username));

  const user = foundUser[0];

  if (!user) {
    return new Response("User doesn't exist.", { status: 400 });
  }

  const comparePasswords = await bcrypt.compare(
    password,
    user.password as string
  );

  if (!comparePasswords) {
    return new Response("Falsches Passwort.", { status: 400 });
  }

  const res = NextResponse.json({ message: "Loggin erfolgreich" });

  res.cookies.set("userId", user.uuid, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
