import { db } from "@/db";
import { Abos } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAboStatus(userUuid: string) {

    

const aboStatus = await db.select().from(Abos).where(eq(Abos.user_uuid, userUuid));

let abo =  aboStatus[0]?.abo && aboStatus[0]?.end_date && new Date(aboStatus[0]?.end_date) > new Date() || false;

return abo;

}