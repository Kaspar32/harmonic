import { db } from "@/db";
import { likes } from "@/db/schema";
import {and,or, eq} from 'drizzle-orm'

export async function getLikesYouById(uuid: string) {
  return db.select().from(likes).where(eq(likes.to, uuid));
}