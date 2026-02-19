import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profilePictures, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;
  if(!userId){
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { images } = await req.json();

    console.log("Received images for reordering:", images);

    await db
            .update(users)
            .set({
              profile_pics: images,
            })
            .where(eq(users.uuid, userId));

    

    return NextResponse.json({ message: "Images saved successfully" });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}




