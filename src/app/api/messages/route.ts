import { messages, users } from "@/db/schema"; // Beispiel: deine DB-Funktion
import { db } from "@/db";
import { cookies } from "next/headers";
import { eq, and, or } from "drizzle-orm";

export async function GET(req: { url: string | URL }) {
  try {
    // Extract chatPartner from query parameters
    const url = new URL(req.url);
    const chatPartner = url.searchParams.get("chatPartner");

    if (!chatPartner) {
      return new Response(
        JSON.stringify({ error: "Chat partner not provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const cookieStore = cookies();
    const userId = (await cookieStore).get("userId")?.value;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Fethcing name for uuid
    const userResult = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.uuid, userId));

    if (!userResult[0]?.name) {
      return new Response(JSON.stringify({ error: "User name not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.fromUser, userResult[0].name),
            eq(messages.toUser, chatPartner),
          ),
          and(
            eq(messages.fromUser, chatPartner),
            eq(messages.toUser, userResult[0].name),
          ),
        ),
      )
      .orderBy(messages.createdAt);

    return new Response(JSON.stringify(msgs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Fehler beim Abrufen der Nachrichten" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
