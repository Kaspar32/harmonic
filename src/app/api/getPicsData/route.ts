import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: Request) {

  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const imagesData = await db
    .select({ profile_pics: users.profile_pics })
    .from(users)
    .where(eq(users.uuid, userId));

  console.log(imagesData);

  if (imagesData.length === 0) {
    return NextResponse.json({ error: "ImagesData not found for user" }, { status: 404 });
  }

  return NextResponse.json(imagesData[0]);
}
