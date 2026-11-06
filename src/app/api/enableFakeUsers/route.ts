
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";


export async function GET(request:NextRequest){

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
    const FakeUser = await db.select({ fakeUsersEnabled: users.fakeUsersEnabled }).from(users).where(eq(users.uuid, userfromAuth.uuid));
    return Response.json({ success: true, Fake: FakeUser });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch FakeUseresEnabled" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), {
      status: 401,
    });
  }

  const { fakeUsersEnabled } = await req.json();

  await db
    .update(users)
    .set({ fakeUsersEnabled })
    .where(eq(users.uuid, userId));

  return new Response("yay", { status: 200 });
}
  
