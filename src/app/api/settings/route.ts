import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

//GET
export async function GET(req:NextRequest) {
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

  const einstellungen = await db
    .select()
    .from(settings)
    .where(eq(settings.uuid, userfromAuth.uuid));

  if (einstellungen.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(einstellungen);
}

//POST
export async function POST(request: Request) {
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

  try {
    const body = await request.json();
    const { intresse, alter, interest_location, radius } = body;

    if (!alter) {
      return new Response(
        JSON.stringify({ error: "Intresse and alter is required" }),
        {
          status: 400,
        }
      );
    }

    const existingSettings = await db
      .select()
      .from(settings)
      .where(eq(settings.uuid, userfromAuth.uuid));

    if (existingSettings.length > 0) {
      await db
        .update(settings)
        .set({ intresse: intresse, alter: alter, radius: radius })
        .where(eq(settings.uuid, userfromAuth.uuid));
    } else {
      await db.insert(settings).values({ intresse, uuid: userfromAuth.uuid, alter, radius });
    }

    return new Response(JSON.stringify({ message: "Settings added" }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
