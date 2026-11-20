import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    const token = req.cookies.get("authtoken")?.value;
    if (!token) {
        
        return new NextResponse("Nicht eingeloggt", { status: 401 });
    }
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!);

        
    } catch(err) {
        console.error("JWT ERROR:", err);
        return new NextResponse("Invalider Token", { status: 401 });
    }

    const userId = (payload as any).userId;

    const userData = await db.select({uuid: users.uuid,
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
    last_match_check: users.last_match_check,}).from(users).where(eq(users.uuid, userId)).limit(1);

    if (userData.length === 0) return new NextResponse('User not found', { status: 404 });

    return new NextResponse(JSON.stringify(userData[0]), {
    headers: { "Content-Type": "application/json" }
    });
}
