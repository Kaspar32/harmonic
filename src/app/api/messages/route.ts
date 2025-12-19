import { messages } from "@/db/schema"; // Beispiel: deine DB-Funktion
import { db } from "@/db";
export async function GET(req: { url: string | URL; }) {
  try {
    


    const msgs = await db
      .select()
      .from(messages)
      .orderBy(messages.createdAt);

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