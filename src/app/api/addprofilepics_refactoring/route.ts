import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/test";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";

export async function POST(req: NextRequest) {


  let user;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      user = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  try {
    const payload: {
      id: string;
      image_base64: string | null;
      position: number;
    }[] = await req.json();

    const currentPics = user.profile_pics || [];
    let newPics = [...currentPics];
    const positionToFilename: { [key: number]: string } = {};

    for (const img of payload) {
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

      const blurredBuffer = await sharp(buffer).blur(60).toBuffer();

      const timestamp = Date.now();
      const filename = `${img.id}_${timestamp}.png`;
      const filePath = path.join(
        process.cwd(),
        "uploads/images",
        filename,
      );
      await fs.writeFile(filePath, buffer);


      const filePathblurred = path.join(
        process.cwd(),
        "uploads/images",
        `${img.id}_${timestamp}_blurred.png`,
      );
      await fs.writeFile(filePathblurred, blurredBuffer);

      positionToFilename[img.position] = filename;
    }

    // Update newPics with the new filenames at their positions
    for (const pos in positionToFilename) {
      const position = parseInt(pos);
      newPics[position] = positionToFilename[position];
    }

    // Remove null or undefined entries if any, but since it's an array, keep the length
    // But to avoid sparse arrays, perhaps filter, but better keep as is for positions

    console.log("New Pics:", newPics);

    await db
      .update(users)
      .set({
        profile_pics: JSON.stringify(newPics),
      })
      .where(eq(users.uuid, user.uuid));

    return NextResponse.json({ message: "Images saved successfully" });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
