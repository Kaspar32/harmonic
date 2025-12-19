import { NextResponse } from "next/server";
import { db } from "@/db"; // dein drizzle client
import { users } from "@/db/schema"; // dein schema
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";


export async function POST(req: Request) {
  try {
    const trackData = await req.json();


    console.log("Eingehende Daten:", trackData);

    const cookieStore = cookies();

    const userId = (await cookieStore).get("userId")?.value;

    if (!userId) return new Response("Not logged in");

    if (!userId || !trackData) {
      return NextResponse.json(
        { error: "userId und tracks sind erforderlich" },
        { status: 400 }
      );
    }

    console.log("empfangenes data:", trackData);

    // update des Users mit neuen TopTracks (überschreibt alte)
    const updated = await db
      .update(users)
      .set({ favorite_track: trackData })
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
