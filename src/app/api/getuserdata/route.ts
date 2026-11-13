import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/auth";


export async function GET(request: NextRequest) {
  
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return new NextResponse(null, { status: 401 });
 
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
    last_match_check: users.last_match_check,}).from(users).where(eq(users.uuid, userId));

  if (!user) return new NextResponse("Benutzer nicht gefunden", { status: 404 });

  return NextResponse.json(user); 
}
