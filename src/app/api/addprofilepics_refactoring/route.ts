import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/test";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const userId = (await cookieStore).get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload: {
      id: string;
      image_base64: string | null;
      position: number;
    }[] = await req.json();

    let eintrag = [];

    for (const [index, img] of payload.entries()) {
      if (!img.image_base64) continue;

      const uploadDir = path.join(process.cwd(), "uploads/images");

      // alle Dateien im Ordner holen
      const existingFiles = await fs.readdir(uploadDir);

      // nur Dateien mit gleicher img.id vorne
      const toDelete = existingFiles.filter((file) =>
        file.startsWith(img.id + "_"),
      );

      // löschen
      await Promise.all(
        toDelete.map((file) => fs.unlink(path.join(uploadDir, file))),
      );

      // Base64 -> Buffer

      const base64Data = img.image_base64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );

      const buffer = Buffer.from(base64Data, "base64");

      const timestamp = Date.now();
      const filePath = path.join(
        process.cwd(),
        "uploads/images",
        `${img.id}_${timestamp}.png`,
      );
      await fs.writeFile(filePath, buffer);
      eintrag.push(`${img.id}_${timestamp}.png`);
    }

    console.log("Eintrag:", eintrag);

    await db
      .update(users)
      .set({
        profile_pics: sql`${users.profile_pics} || ${JSON.stringify(eintrag)}::jsonb`,
      })
      .where(eq(users.uuid, userId));

    return NextResponse.json({ message: "Images saved successfully" });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
