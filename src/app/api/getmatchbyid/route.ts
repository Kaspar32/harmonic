import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and } from "drizzle-orm"; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Fehlende Nutzer-ID" }, { status: 400 });
  }

  try {
    // Alle Likes holen, die vom aktuellen Nutzer ausgehen
    const vonMirGelikt = await db
      .select({
        from: likes.from,
        to: likes.to,
        id: likes.id
      })
      .from(likes)
      .where(eq(likes.from, id));

    const gegenseitigeLikes = await Promise.all(
      vonMirGelikt.map(async (like) => {
        if (!like.to) return null; // Sicherheitscheck

        const rueckLike = await db
          .select()
          .from(likes)
          .where(
            and(
              eq(likes.from, like.to),  // hat der andere Nutzer mich auch geliked?
              eq(likes.to, id)          // zielt der Like auf mich?
            )
          );

        return rueckLike.length > 0 ? like : null;
      })
    );

    const gefilterteMatches = gegenseitigeLikes.filter((match) => match !== null);

    return NextResponse.json(gefilterteMatches);
  } catch (error) {
    console.error("Fehler beim Abrufen der Matches:", error);
    return NextResponse.json({ message: "Serverfehler beim Abruf" }, { status: 500 });
  }
}
