// app/images/[...name]/route.ts
import { join } from "path";
import { promises as fs } from "fs";
import { and, eq, sql } from "drizzle-orm";
import { likes, users } from "@/db/schema";
import { db } from "@/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  try {
    // Warte auf das gesamte params-Objekt

    const awaitedParams = await Promise.resolve(params || {});
    const fileSegments = awaitedParams.name || [];

    // Auskommentiert: Regelwerk :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    /*let userfromAuth;
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

    if (!userfromAuth) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }*/

    //const currentUser = userfromAuth.uuid;

    /*const targetUser = await db
      .select()
      .from(users)
      .where(sql`${users.profile_pics}::text LIKE ${"%" + fileSegments + "%"}`);

    const ilikedRes = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.from, currentUser), eq(likes.to, targetUser[0].uuid)),
      );

    const iliked = ilikedRes.length > 0;

    const targetLikedRes = await db
      .select()
      .from(likes)
      .where(
        and(eq(likes.from, targetUser[0].uuid), eq(likes.to, currentUser)),
      );

    const targetLiked = targetLikedRes.length > 0;*/

    let filePath = join(process.cwd(), "uploads", "images", ...fileSegments);

    const ext = (filePath.split(".").pop() ?? "").toLowerCase();

    // Check abo-status
    /*const aboRes = await fetch("http://localhost:3000/api/getAboStatus", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (!aboRes.ok) {
      return new Response("Could not determine abo status", {
        status: 500,
      });
    }

    const aboData = await aboRes.json();

    const { searchParams } = new URL(request.url)

    const context = searchParams.get("context");*/

    // Wenn der User ein Abo hat, dann greift das Regelwerk nicht, sonst schon
    /*if (!aboData && context!="profile") {
      if (targetLiked && !iliked) {
        filePath = filePath.replace("." + ext, "_blurred." + ext);
      }
    } else {
      console.log("Hat abo oder Anfrage kommt von Profile!" + aboData);
    }*/

    const contentType =
      {
        png: "image/png",
        gif: "image/gif",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        svg: "image/svg+xml",
      }[ext] || "application/octet-stream";

    let fileBuffer = await fs.readFile(filePath);

    // Convert Buffer to Uint8Array for Response compatibility
    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
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
