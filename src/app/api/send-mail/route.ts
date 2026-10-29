import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

type MailAttachment = {
  filename: string;
  path: string;
  cid: string;
}

const transporter = nodemailer.createTransport({
  host: "mail.gmx.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


async function sendMail(to: string, subject: string, html: string, attachments: MailAttachment[] = []) {
  try
  {
    const logoPath = path.join(process.cwd(), 'public', 'Logo.png');

    await transporter.sendMail({
      from: '"harmonic.ch" <harmonic@gmx.ch>',
      to,
      subject,
      html,
      attachments: [
        {
            filename: 'Logo.png',
            path: logoPath,
            cid: 'rt'
        },
        ...attachments,
    ]
    });
  }
  catch (error: unknown)
  {
    const err = error as Error;
    console.log('Fehler beim Senden der E-Mail:', err.message);
  }
}

// API-Route
export async function POST(request: Request) {
  try {
    // JSON-Daten aus der Anfrage extrahieren
    const { to, subject, html, attachments } = await request.json();
    //console.log('Server: E-Mail-Daten:', { from, to, subject, html });
    
    // E-Mail senden
    await sendMail(to, subject, html, attachments);

    // Erfolgsantwort zurückgeben
    return NextResponse.json({ success: true, message: 'E-Mail wurde gesendet.' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: 'Fehler beim Senden der E-Mail.', error: err.message },
      { status: 500 }
    );
  }
}
