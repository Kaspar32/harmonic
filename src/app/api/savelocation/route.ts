import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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
    let data = await req.json();

    console.log("Request body:", data.location);
    const updated = await db
      .update(users)
      .set({ location: data.location })
      .where(eq(users.uuid, userfromAuth.uuid))
      .returning();

    return Response.json(updated[0], { status: 200 });
  } catch (error) {
    console.error("Fehler beim Speichern von Spotify Data:", error);
    return Response.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
