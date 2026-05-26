import { boosts } from "@/db/schema";
import { db } from "@/lib/test";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  try {
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

    await db.insert(boosts).values({
      uuid: userfromAuth.uuid,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      multiplier: 1500,
    });

    return NextResponse.json({ message: "Boost added" }, { status: 200 });
  } catch (error) {
    console.error("Add boost error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
