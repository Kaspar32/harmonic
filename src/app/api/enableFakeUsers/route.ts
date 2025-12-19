
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";


export async function GET(){

  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
    });
  }

  try {
    const FakeUser = await db.select({ fakeUsersEnabled: users.fakeUsersEnabled }).from(users).where(eq(users.uuid, userId));
    return Response.json({ success: true, Fake: FakeUser });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch FakeUseresEnabled" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID is required" }), {
      status: 400,
    });
  }

  const { fakeUsersEnabled } = await req.json();

  await db
    .update(users)
    .set({ fakeUsersEnabled })
    .where(eq(users.uuid, userId));

  return new Response("yay", { status: 200 });
}
  
