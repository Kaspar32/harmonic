import { NextResponse } from "next/server";
import { db } from "@/db"; // dein drizzle client
import { users } from "@/db/schema"; // dein schema
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";


export async function POST(req: Request) {

  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }



  try {
    const artistData = await req.json();


  

    if (!artistData) {
      return NextResponse.json(
        { error: "userId und artists sind erforderlich" },
        { status: 400 }
      );
    }

    console.log("empfangenes data:", artistData);

    // update des Users mit neuen TopTracks (überschreibt alte)
    const updated = await db
      .update(users)
      .set({ favorite_artist: artistData })
      .where(eq(users.uuid, userfromAuth.uuid))
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
