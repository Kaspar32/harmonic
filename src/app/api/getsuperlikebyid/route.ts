import { NextResponse } from "next/server";
import { db } from "@/db";
import { superlikes } from "@/db/schema";
import {eq} from 'drizzle-orm'

export async function GET (request: Request){

    const {searchParams} = new URL(request.url);

    const id = searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
      }

 try {
    const superLikes = await db.select().from(superlikes).where(eq(superlikes.to, id));
    return NextResponse.json(superLikes)
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }

}