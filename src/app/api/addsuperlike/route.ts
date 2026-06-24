import { NextResponse } from "next/server";
import { db } from "@/db";
import { superlikes, likes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const superLikes = await db.select().from(superlikes);
    return NextResponse.json(superLikes);
  } catch (error) {
    console.log("Error fetching likes:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to} = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "From and To required" },
        { status: 400 },
      );
    }


    const existingLike = await db
      .select()
      .from(superlikes)
      .where(and(eq(superlikes.from, from), eq(superlikes.to, to)));

    if (existingLike.length === 0) {

        await db.insert(superlikes).values({ from, to });
        await db.insert(likes).values({ from, to });

    }
    return NextResponse.json({ message: "Like added" }, { status: 200 });
  } catch (error) {
    console.error("addlike error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
