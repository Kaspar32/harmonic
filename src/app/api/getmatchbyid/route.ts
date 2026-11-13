import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

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
        id: likes.id,
      })
      .from(likes)
      .where(eq(likes.from, id));

    if (vonMirGelikt.length === 0) {
      return NextResponse.json([]);
    }

    // Ein einziger Query: Finde alle Likes, die auf mich zeigen
    // und deren `from` in meiner Like-Liste steht
    const rueckLikes = await db
      .select({
        from: likes.from,
        to: likes.to,
      })
      .from(likes)
      .where(
        and(
          eq(likes.to, id), // zielt auf mich
          inArray(
            likes.from,
            vonMirGelikt
              .map((l) => l.to)
              .filter((to): to is string => to !== null),
          ), // von jemandem den ich geliked habe
        ),
      );

    // Match-Liste bauen: Nur die Likes, die in rueckLikes vorkommen
    const matchedIds = new Set(rueckLikes.map((l) => l.from));
    const gefilterteMatches = vonMirGelikt.filter(
      (like) => like.to && matchedIds.has(like.to),
    );

    return NextResponse.json(gefilterteMatches);
  } catch (error) {
    console.error("Fehler beim Abrufen der Matches:", error);
    return NextResponse.json(
      { message: "Serverfehler beim Abruf" },
      { status: 500 },
    );
  }
}
