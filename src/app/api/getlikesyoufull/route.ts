import { db } from "@/db";
import { likes, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id");

  if (!id) {
    return Response.json([], { status: 400 });
  }

  const result = await db
    .select({
      uuid: users.uuid,
      name: users.name,
      alter: users.alter,
      profile_pics: users.profile_pics,
    })
    .from(likes)
    .leftJoin(users, eq(users.uuid, likes.from))
    .where(eq(likes.to, id));

  return Response.json(result);
}