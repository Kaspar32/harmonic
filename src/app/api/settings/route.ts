import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

//GET
export async function GET() {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const einstellungen = await db
    .select()
    .from(settings)
    .where(eq(settings.uuid, userId));

  if (einstellungen.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(einstellungen);
}

//POST
export async function POST(request: Request) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  console.log(userId);

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
    });
  }

  try {
    const body = await request.json();
    const { intresse, alter } = body;

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
      .where(eq(settings.uuid, userId));

    if (existingSettings.length > 0) {
      await db
        .update(settings)
        .set({ intresse: intresse, alter: alter })
        .where(eq(settings.uuid, userId));
    } else {
      await db.insert(settings).values({ intresse, uuid: userId, alter });
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
