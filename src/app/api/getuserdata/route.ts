import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request:NextRequest) {
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

  if(!userfromAuth) return new NextResponse(null, { status: 401 });
 
  const [user] = await db.select({uuid: users.uuid,
    name: users.name,
    geschlecht: users.geschlecht,
    alter: users.alter,
    geburtstag: users.geburtstag,
    groesse: users.groesse,
    ausbildung: users.ausbildung,
    intressen: users.intressen,
    ichsuche: users.ichsuche,
    genres: users.genres,
    favorite_track: users.favorite_track,
    favorite_artist: users.favorite_artist,
    roles: users.roles,
    fakeUsersEnabled: users.fakeUsersEnabled,
    profile_pics: users.profile_pics,
    location: users.location,
    email: users.email,
    last_match_check: users.last_match_check,}).from(users).where(eq(users.uuid, userfromAuth.uuid));

  if (!user) return new NextResponse("Benutzer nicht gefunden", { status: 404 });

  return NextResponse.json(user); 
}
