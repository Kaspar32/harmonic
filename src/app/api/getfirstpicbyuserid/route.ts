import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const images = await db
    .select({ profile_pics: users.profile_pics })
    .from(users)
    .where(eq(users.uuid, id))
    .limit(1);

  if (images.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const pics = images[0].profile_pics as string[] | null;

  if (!pics || pics.length === 0) {
    return NextResponse.json(null);
  }

  const firstImageString = pics[0];

  const first_image = {
    user_id: id,
    image_path: firstImageString,
  };

  return NextResponse.json(first_image || null);
}
