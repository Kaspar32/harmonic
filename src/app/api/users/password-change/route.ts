import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { generateEasyPassword } from '@/lib/utils';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {

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

  if (!userfromAuth?.uuid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Daten aus der Anfrage
    const { password } = await req.json();

    // Validierung der Eingaben
    if (!password) {
      return NextResponse.json(
        { message: 'Passwort ist erforderlich.' },
        { status: 400 }
      );
    }

    // Benutzer über die uuid finden

    const existing = await db.select().from(users).where(eq(users.uuid, userfromAuth.uuid));

    if (!existing[0]) {
      return NextResponse.json(
        { message: 'Benutzer nicht gefunden.' },
        { status: 400 }
      );
    }

    // Neues Passwort
    const hashedPassword = await bcrypt.hash(password, 10);

    // Passwort in der Datenbank aktualisieren

    const updated = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.uuid, existing[0].uuid))
      .returning();

   
    
    // Erfolgsmeldung
    return NextResponse.json(
      { message: 'Passwort ersetzt!' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Ändern des Passworts.' },
      { status: 500 }
    );
  }
}
