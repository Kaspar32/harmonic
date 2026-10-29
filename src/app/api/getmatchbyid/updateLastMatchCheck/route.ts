import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  const result = await db
    .select({
      lastMatchCheck: users.last_match_check,
    })
    .from(users)
    .where(eq(users.uuid, userfromAuth?.uuid))
    .limit(1);

    console.log("Result form DB"+result[0].lastMatchCheck)

   return NextResponse.json(result[0] ?? null);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { uuid } = body;

  if (!uuid) {
    return NextResponse.json({ error: "UUID is required" }, { status: 400 });
  }

  await db
    .update(users)
    .set({ last_match_check: new Date() })
    .where(eq(users.uuid, uuid));
}
