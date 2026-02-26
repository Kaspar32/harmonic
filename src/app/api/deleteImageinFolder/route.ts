import path from "path";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // Authentifizierung

  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
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
    const { Imageid: id } = await request.json();
    console.log("ID zum Löschen:", id);

    const directory = path.join(process.cwd(), "uploads/images");
    const files = await fs.readdir(directory);
    for (const file of files) {
      if (file.startsWith(`${id}`)) {
        //console.log("Lösche Datei:", file);
        await fs.unlink(path.join(directory, file));
      }
    }

    // Löschen des Namens in der Datenbank

    const user = await db.select().from(users).where(eq(users.uuid, userfromAuth.uuid));

    const pics = user[0].profile_pics as string[];

    const newPics = pics.filter((pic) => !pic.startsWith(id));

    console.log("Aktualisierte Bilderliste:", newPics);

    await db
      .update(users)
      .set({ profile_pics: newPics })
      .where(eq(users.uuid, userfromAuth.uuid));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
  // Löschen der Bilder im Ordner
}
