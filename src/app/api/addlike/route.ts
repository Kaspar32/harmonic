import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";

export async function GET() {
  try {
    const Likes = await db.select().from(likes);
    return NextResponse.json(Likes);
  } catch (error) {
    console.log("Error fetching likes:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}




export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to, isFakeUser } = body;

    if (!from || !to) {
      return NextResponse.json(
        { error: "From and To required" },
        { status: 400 }
      );
    }

    const isFake = isFakeUser === true || isFakeUser === "true";

   // console.log("is user fake?", isFake);

    if (isFake) {
      await db.insert(likes).values({ from, to });
      
      await db.insert(likes).values({ from: to, to: from });
    } else {
      await db.insert(likes).values({ from, to });
    }

    return NextResponse.json({ message: "Like added" }, { status: 200 });
  } catch (error) {
    console.error("addlike error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
