import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function GET(request: Request) {

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

  const imagesData = await db
    .select({ profile_pics: users.profile_pics })
    .from(users)
    .where(eq(users.uuid, userfromAuth.uuid));

  console.log(imagesData);

  if (imagesData.length === 0) {
    return NextResponse.json({ error: "ImagesData not found for user" }, { status: 404 });
  }

  return NextResponse.json(imagesData[0]);
}
