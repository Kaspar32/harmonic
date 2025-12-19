import { db } from "@/db";
import { dislikes } from "@/db/schema";

export async function POST(req: Request) {
  const body = await req.json();
  const { from, to } = body;

  console.log(to);

  if (!body) {
    return new Response(JSON.stringify({ error: "From and To is required" }), {
      status: 400,
    });
  }

  await db.insert(dislikes).values({
    from: from,
    to: to,
  });

  return new Response(JSON.stringify({ message: "dislikes", body }), {
    status: 200,
  });
}
