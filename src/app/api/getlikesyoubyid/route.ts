import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";
import {eq} from 'drizzle-orm'

export async function GET (request: Request){

    const {searchParams} = new URL(request.url);

    const id = searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
      }

 try {
    const Likes = await db.select().from(likes).where(eq(likes.to, id));
    return NextResponse.json(Likes)
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

}