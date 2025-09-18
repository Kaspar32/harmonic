import { NextResponse } from "next/server";
import { db } from "@/db"; // dein drizzle client
import { users } from "@/db/schema"; // dein schema
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json(
        { error: "userId und tracks sind erforderlich" },
        { status: 400 }
      );
    }

    // update des Users mit neuen TopTracks (überschreibt alte)
    const updated = await db
      .update(users)
      .set({ spotify_data: data})
      .where(eq(users.uuid, userId))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Fehler beim Speichern von Spotify Data:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}