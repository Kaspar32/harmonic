
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
  const aboStatus = await db.select().from(Abos).where(eq(Abos.user_uuid, userfromAuth.uuid));

  let abo =  aboStatus[0].abo && aboStatus[0].end_date && new Date(aboStatus[0].end_date) > new Date();

  return  Response.json(abo);

}