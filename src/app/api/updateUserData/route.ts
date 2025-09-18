import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { json } from "stream/consumers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  try {
    const body = await req.json();
    const {
      uuid,
      name,
      geschlecht,
      alter,
      grösse,
      ausbildung,
      ichsuche,
      intressen,
      genres
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userID fehlt fehlt" },
        { status: 400 }
      );
    }

    let geschlechtKontrolle = geschlecht;
    let ausbildungKontrolle = ausbildung;

    if (geschlecht === "Auswählen") {
      geschlechtKontrolle = null;
    }

    if (ausbildung === "Auswählen") {
      ausbildungKontrolle = null;
    }

    const result = await db
      .update(users)
      .set({
        name: name,
        geschlecht: geschlechtKontrolle,
        alter: alter,
        grösse: grösse,
        ausbildung: ausbildungKontrolle,
        ichsuche: ichsuche,
        intressen: intressen,
        genres: genres,
      })
      .where(eq(users.uuid, userId))
      .returning();

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Update fehlgeschlagen" },
      { status: 500 }
    );
  }
}
