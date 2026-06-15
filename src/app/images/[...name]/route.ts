// app/images/[...name]/route.ts
import { join } from "path";
import { promises as fs } from "fs";
import { db } from "@/db";
import { users, likes } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  try {
    const url = new URL(request.url);
    const blurFlag = url.searchParams.get("blur");

    // Warte auf das gesamte params-Objekt

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

    // User Uuid from Auth
    let currentUserId = userfromAuth.uuid;

    // TargetUser Uuid herausfinden anhand des Target
    const filename = fileSegments[fileSegments.length - 1];

    const targetUserResult = await db
      .select()
      .from(users)
      .where(
        sql`${users.profile_pics} @> ${JSON.stringify([filename])}::jsonb`,
      );

    console.log("filename raw:", JSON.stringify(filename));


    if (currentUserId == null) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (targetUserResult.length === 0) {
      return new Response(JSON.stringify({ error: "Target user not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("filename", filename);
    console.log("targetUserResult", targetUserResult);

    const targetUserId = targetUserResult[0].uuid;

    // Wächter: folgendes Regelwerk wird überprüft:
    /*Hat currentUser targetUser geliked?
    JA  -> unblurred
 
    NEIN ->
        Hat targetUser currentUser geliked?
            JA  -> blurred
            NEIN -> unblurred (oder kommt gar nicht in Likes-Liste vor)*/

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
    });
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
