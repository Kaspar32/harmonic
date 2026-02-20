import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profilePictures, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { cookies } from "next/headers";
import path from "path";
import fs from "fs/promises";

/* import {
  RekognitionClient,
} from "@aws-sdk/client-rekognition"; */

/* const rekognition = new RekognitionClient({
  region: "eu-central-1", // oder deine AWS-Region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

 async function isExplicitImage(base64: string): Promise<boolean> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const command = new DetectModerationLabelsCommand({
    Image: { Bytes: buffer },
  });

  const response = await rekognition.send(command);

  return (
    response.ModerationLabels?.some(
      (label) =>
        (label.Name === "Explicit Nudity" || label.Name === "Suggestive") &&
        (label.Confidence ?? 0) > 90
    ) ?? false
  ); 
} */

export async function GET(req: NextRequest) {
  try {
    const pictures = await db.select().from(profilePictures);
    return NextResponse.json(pictures);
  } catch (error) {
    console.error("Error fetching profile pictures:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

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
      user_id: string;
    }[] = await req.json();




    let eintrag=[];

    for (const [index, img] of payload.entries()) {

      if (!img.image_base64) continue;
      

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
          profile_pics: sql`${users.profile_pics} || ${JSON.stringify(eintrag)}`
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
