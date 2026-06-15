// app/images/[...name]/route.ts
import { join } from "path";
import { promises as fs } from "fs";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  try {
    const url = new URL(request.url);

    const targetUuid = url.searchParams.get("targetuuid");

    const awaitedParams = await Promise.resolve(params || {});
    const fileSegments = awaitedParams.name || [];
    const filePath = join(process.cwd(), "uploads", "images", ...fileSegments);

    const isBlurred = filePath.endsWith("_blurred.png");

    let userfromAuth;
    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      });

      if (res.ok) {
        const UserData = await res.json();
        userfromAuth = UserData;
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }

    // User Uuid from Auth (optional — nicht eingeloggte User sehen Bilder ohne Blur-Logik)
    const currentUserId = userfromAuth?.uuid ?? null;

    if (!targetUuid) {
      return new Response(JSON.stringify({ error: "Missing targetuuid" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const targetUserId = targetUuid;

    // Eigene Bilder oder nicht eingeloggt → immer unverblurrt
    if (!currentUserId || currentUserId === targetUserId) {
      let fileBuffer = await fs.readFile(filePath);
      const ext = (filePath.split(".").pop() ?? "").toLowerCase();
      const contentType =
        {
          png: "image/png",
          gif: "image/gif",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          svg: "image/svg+xml",
        }[ext] || "application/octet-stream";

      return new Response(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Eingeloggter User schaut fremdes Bild → Blur-Logik prüfen

    const relations = await db
      .select()
      .from(likes)
      .where(
        or(
          and(eq(likes.from, currentUserId), eq(likes.to, targetUserId)),
          and(eq(likes.from, targetUserId), eq(likes.to, currentUserId)),
        ),
      );

    const iLikedTarget = relations.some(
      (r) => r.from === currentUserId && r.to === targetUserId,
    );

    const targetLikedMe = relations.some(
      (r) => r.from === targetUserId && r.to === currentUserId,
    );

    let serveBlurred = false;

    // Hier wird das Regelwerk implementiert

    if (!iLikedTarget && targetLikedMe) {
      serveBlurred = true;
    }

    let actualFilePath = filePath;

    console.log("FilePath:", filePath);

    if (serveBlurred) {
      actualFilePath = filePath.replace(
        /\.(png|jpg|jpeg|webp)$/i,
        "_blurred.$1",
      );
    }

    console.log("File Path actual", actualFilePath);

    // Dateityp-Erkennung
    const ext = (actualFilePath.split(".").pop() ?? "").toLowerCase();
    const contentType =
      {
        png: "image/png",
        gif: "image/gif",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        svg: "image/svg+xml",
      }[ext] || "application/octet-stream";

    let fileBuffer = await fs.readFile(actualFilePath);

    // Convert Buffer to Uint8Array for Response compatibility
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // 1 Jahr Caching
      },
    })
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  }
}
