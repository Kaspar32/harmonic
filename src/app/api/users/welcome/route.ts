import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';


export async function POST(req: NextRequest) {

    const { emailAddress, fullName } = await req.json();
    
    if (!emailAddress) {
          return NextResponse.json(
            { message: 'E-Mail-Adresse ist erforderlich.' },
            { status: 400 }
          );
    }

    if (!fullName) {
          return NextResponse.json(
            { message: 'Vollständiger Name ist erforderlich.' },
            { status: 400 }
          );
    }

    // Mail versenden
    const templatePath = path.join(process.cwd(), 'src/mail_templates/welcomeMail.html');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    const emailHtml = templateContent
        .replace('{emailAddress}', emailAddress)
        .replace('{fullName}', fullName);

    await fetch('http://localhost:3000/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: emailAddress,
            subject: 'Willkommen bei harmonic!',
            html: emailHtml,
        }),
    });

// Erfolgsmeldung
    return NextResponse.json(
        { message: 'Willkommens-E-Mail versendet.' },
        { status: 200 }
    );
}