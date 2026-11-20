import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const uuid = body;

    // Drizzle delete account by setting the "deleted" field to true in the database
    await db
      .update(users)
      .set({ deleted: true })
      .where(eq(users.uuid, uuid));


    return new Response(JSON.stringify({ message: "User set to deleted" }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Server error deleting user" }), {
      status: 500,
    });
  }
}