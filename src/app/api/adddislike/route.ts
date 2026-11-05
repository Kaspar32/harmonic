import { db } from "@/db";
import { dislikes } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

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
      userfromAuth = await res.json();
    }
  } catch (error) {
    console.error("Fehler bei der Authentifizierung:", error);
  }

  if (!userfromAuth) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const body = await req.json();
  const { to } = body;

  if (!to) {
    return NextResponse.json({ error: "Zielbenutzer fehlt" }, { status: 400 });
  }

  if (userfromAuth.uuid === to) {
    return NextResponse.json(
      { error: "Du kannst dich nicht selbst ablehnen." },
      { status: 400 },
    );
  }

  await db.insert(dislikes).values({
    from: userfromAuth.uuid,
    to: to,
  });

  return NextResponse.json({ message: "Dislike gespeichert" }, { status: 200 });
}
