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

  const images_res = await db
  .select({ profile_pics: users.profile_pics })
  .from(users)
  .where(eq(users.uuid, id))
  .limit(1);

  if (images_res.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const images_string = (images_res[0].profile_pics as string[]);

  const images = {
    user_id: id,
    image_path: images_string,
  }

  if (!images) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(images);
}
