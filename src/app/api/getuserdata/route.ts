import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.uuid, userId));

  if (!user) return new NextResponse(null, { status: 404 });

  return NextResponse.json(user); 
}
