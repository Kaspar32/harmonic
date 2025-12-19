import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, to } = body;

    console.log(to);

    if (!body) {
      return new Response(
        JSON.stringify({ error: "From and To is required" }),
        {
          status: 400,
        }
      );
    }

    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.from, from), eq(likes.to, to)));

    if (existingLike.length > 0) {
      await db.delete(likes).where(and(eq(likes.from, from), eq(likes.to, to)));

      return new Response(JSON.stringify({ message: "Like removed" }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ message: "Like removed", body }), {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
