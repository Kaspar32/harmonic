import { messages } from "@/db/schema"; // Beispiel: deine DB-Funktion
import { db } from "@/db";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
export async function GET(req: { url: string | URL; }) {
  try {

    const cookieStore = cookies();
    const userId = (await cookieStore).get("userId")?.value;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Fetching messages for userId:", userId);
    const msgs = await db
      .select()
      .from(messages)
      .orderBy(messages.createdAt)
      .where(and(eq(messages.fromUser, userId), eq(messages.toUser, userId)));

    return new Response(JSON.stringify(msgs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Fehler beim Abrufen der Nachrichten" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}