import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return new Response("Benutzername und Passwort sind erforderlich.", {
      status: 400,
    });
  }

  const foundUser = await db
    .select()
    .from(users)
    .where(eq(users.name, username));

  const user = foundUser[0];

  if (!user) {
    return new Response("Login fehlgeschlagen!", { status: 400 });
  }

  const isdeleted = await db
    .select({ deleted: users.deleted })
    .from(users)
    .where(eq(users.uuid, user?.uuid));

  const comparePasswords = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!comparePasswords || isdeleted[0]?.deleted) {
    return new Response("Login fehlgeschlagen! ", { status: 400 });
  }

  const res = NextResponse.json({ message: "Loggin erfolgreich" });

  const jwt = await import("jsonwebtoken");

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new Response("Server ist nicht konfiguriert.", { status: 500 });
  }

  const token = jwt.default.sign({ userId: user.uuid }, secret, {
    expiresIn: "24h",
  });

  res.cookies.set("authtoken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
