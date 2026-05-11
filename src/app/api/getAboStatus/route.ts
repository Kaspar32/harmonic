
import { db } from "@/db";
import { Abos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request){

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

  if (!userfromAuth?.uuid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const aboStatus = await db.select().from(Abos).where(eq(Abos.user_uuid, userfromAuth.uuid));

  let abo =  aboStatus[0]?.abo && aboStatus[0]?.end_date && new Date(aboStatus[0]?.end_date) > new Date() || false;

return  Response.json(abo);

}


export async function POST(req:Request)
{
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

  if (!userfromAuth?.uuid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingAbo = await db.select().from(Abos).where(eq(Abos.user_uuid, userfromAuth.uuid));

  if (existingAbo.length > 0 && existingAbo[0].abo && existingAbo[0].end_date && new Date(existingAbo[0].end_date) > new Date()) {
    return Response.json({ error: "Subscription already active" }, { status: 400 });
  }

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);
  await db.insert(Abos).values({ user_uuid: userfromAuth.uuid, abo: true, start_date: new Date(), end_date: endDate});

  return Response.json({ success: true });
}