import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("body:", body);
    const {
      uuid,
      name,
      geschlecht,
      alter,
      geburtstag,
      groesse,
      ausbildung,
      ichsuche,
      intressen,
      genres,
      email
    } = body;

    if (!uuid) {
      return NextResponse.json(
        { error: "UUID fehlt" },
        { status: 400 }
      );
    }


    console.log("Teeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeest"+geburtstag);

    let geschlechtKontrolle = geschlecht;
    let ausbildungKontrolle = ausbildung;

    if (geschlecht === "Auswählen") {
      geschlechtKontrolle = null;
    }

    if (ausbildung === "Auswählen") {
      ausbildungKontrolle = null;
    }

    const geburtstagDate = geburtstag ? new Date(geburtstag) : null;

    console.log(""+geburtstagDate);

    const result = await db
      .update(users)
      .set({
        name: name,
        geschlecht: geschlechtKontrolle,
        alter: alter,
        geburtstag: geburtstagDate,
        groesse: groesse,
        ausbildung: ausbildungKontrolle,
        ichsuche: ichsuche,
        intressen: intressen,
        genres: genres,
        email: email
      })
      .where(eq(users.uuid, uuid))
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
