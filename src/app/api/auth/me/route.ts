import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {


    const secret = process.env.JWT_SECRET;

    const token = req.cookies.get("userId")?.value;

    if (!token) {
        return new NextResponse("Nicht eingeloggt", { status: 401 });
    }

    let payload;

    try {
        payload = jwt.verify(token, secret!);
    } catch {
        return new NextResponse("Invalider Token", { status: 401 });
    }

    const userId = (payload as any).userId;

    const userData = await db.select().from(users).where(eq(users.uuid, userId)).limit(1);
   
   
    if (userData.length === 0) return new NextResponse('User not found', { status: 404 });

    return new NextResponse(JSON.stringify(userData[0]), {
    headers: { "Content-Type": "application/json" }
    });
}
