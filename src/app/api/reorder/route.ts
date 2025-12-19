import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profilePictures } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  try {
    const { images } = await req.json();

    //console.log("tesssst", images);

    for (const image of images) {
      await db
        .update(profilePictures)
        .set({
          position: image.position,
        })
        .where(
          and(
            eq(profilePictures.id, image.id),
            eq(profilePictures.userUuid, userId as string)
          )
        );
    }
    return NextResponse.json({ message: "Images saved successfully" });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}




