import { NextResponse } from "next/server";
import { db } from "@/db";
import { profilePictures } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const images = await db
    .select()
    .from(profilePictures)
    .where(eq(profilePictures.userUuid, id));

  //console.log(images);

  if (images.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(images);
}
