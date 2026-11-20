import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { likes } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Fehlende Nutzer-ID" },
      { status: 400 }
    );
  }

  try {
    // Alle Likes des aktuellen Nutzers laden
    const vonMirGelikt = await db
      .select({
        id: likes.id,
        from: likes.from,
        to: likes.to,
        likedAt: likes.likedAt,
      })
      .from(likes)
      .where(eq(likes.from, id));

    const matches = await Promise.all(
      vonMirGelikt.map(async (like) => {
        if (!like.to) return null;

        // Hat die andere Person ebenfalls zurückgeliked?
        const [rueckLike] = await db
          .select({
            id: likes.id,
            from: likes.from,
            to: likes.to,
            likedAt: likes.likedAt,
          })
          .from(likes)
          .where(
            and(
              eq(likes.from, like.to),
              eq(likes.to, id)
            )
          );

        if (!rueckLike) return null;

        // Falls likedAt doch null sein sollte
        if (!like.likedAt || !rueckLike.likedAt) {
          return null;
        }

        // Match entsteht beim späteren der beiden Likes
        const matchCreatedAt = new Date(
          Math.max(
            like.likedAt.getTime(),
            rueckLike.likedAt.getTime()
          )
        );

        return {
          matchId: `${like.from}-${like.to}`,
          userId: like.to,

          myLike: {
            id: like.id,
            likedAt: like.likedAt,
          },

          otherLike: {
            id: rueckLike.id,
            likedAt: rueckLike.likedAt,
          },

          matchCreatedAt,
        };
      })
    );

    const gefilterteMatches = matches
      .filter(
        (
          match
        ): match is NonNullable<typeof match> => match !== null
      )
      .sort(
        (a, b) =>
          b.matchCreatedAt.getTime() -
          a.matchCreatedAt.getTime()
      );

    return NextResponse.json(gefilterteMatches);
  } catch (error) {
    console.error("Fehler beim Abrufen der Matches:", error);

    return NextResponse.json(
      { message: "Serverfehler beim Abruf" },
      { status: 500 }
    );
  }
}