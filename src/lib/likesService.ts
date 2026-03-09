import { db } from "@/db";
import { likes } from "@/db/schema";
import {and,or, eq} from 'drizzle-orm'

export async function getLikesYouById(uuid: string) {
  return db.select().from(likes).where(eq(likes.to, uuid));
}

export async function hasMatch(uuid1:string, uuid2:string)
{
  const results= await db.select().from(likes).where(or(and(eq(likes.from, uuid1),eq(likes.to,uuid2)), and(eq(likes.from, uuid2),eq(likes.to,uuid1))));


  return results.length===2;

}