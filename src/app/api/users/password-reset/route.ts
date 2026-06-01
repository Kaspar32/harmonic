import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { generateEasyPassword } from '@/lib/utils';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';


export async function POST(req: NextRequest) {

  try {
    // Daten aus der Anfrage
    const { emailAddress } = await req.json();

    // Validierung der Eingaben
    if (!emailAddress) {
      return NextResponse.json(
        { message: 'E-Mail-Adresse ist erforderlich.' },
        { status: 400 }
      );
    }

    // Benutzer über die E-Mail-Adresse finden

    const existing = await db.select().from(users).where(eq(users.email, emailAddress));


    if (!existing[0].email || !existing[0].name) {
      return NextResponse.json(
        { message: 'Fehler aufgetreten' },
        { status: 400 }
      );
    }

    // Neues Passwort
    const password = generateEasyPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Passwort in der Datenbank aktualisieren

    const updated = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, existing[0].email))
      .returning();


    // Mail versenden
    const templatePath = path.join(process.cwd(), 'src/mail_templates/resetPasswordMail.html');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');


    const emailHtml = templateContent
    .replace('{emailAddress}', existing[0].email)
    .replace('{password}', password)
    .replace('{fullName}', existing[0].name);

    await fetch('http://localhost:3000/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        to: existing[0].email,
        subject: 'Neues Passwort',
        html: emailHtml,
        }),
    });

   
    
    // Erfolgsmeldung
    return NextResponse.json(
      { message: 'Passwort per Email versendet.' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Fehler beim Zurücksetzen des Passworts.' },
      { status: 500 }
    );
  }
}
