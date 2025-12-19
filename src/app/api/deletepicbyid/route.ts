import { db } from "@/db";
import { profilePictures } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { id } = await request.json();
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;
  console.log(userId);

  try {
    await db.delete(profilePictures).where(
      and(

        eq(profilePictures.userUuid, userId as string),
        eq(profilePictures.id, `${userId}-img-${id}`)
      )
    );

    return Response.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return Response.json({ message: "Error" }, { status: 500 });
  }
}
