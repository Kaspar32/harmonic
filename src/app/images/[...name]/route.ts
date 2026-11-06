// app/images/[...name]/route.ts
import { join } from "path";
import { promises as fs } from "fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string[] }> },
) {
  try {
    // Warte auf das gesamte params-Objekt

    const awaitedParams = await Promise.resolve(params || {});
    const fileSegments = awaitedParams.name || [];

    let filePath = join(process.cwd(), "uploads", "images", ...fileSegments);

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
