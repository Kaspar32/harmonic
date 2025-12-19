import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profilePictures } from "@/db/schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { cookies } from "next/headers";
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

export async function GET() {
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

  try {
    const payload: {
      id: string;
      image_base64: string | null;
      user_id: string;
    }[] = await req.json();

    //console.log(payload);

    /*
    for (const img of payload) {
      if (img.image_base64) {
        const isNSFW = await isExplicitImage(img.image_base64);
        if (isNSFW) {
          return NextResponse.json(
            { message: "Unerlaubte Inhalte erkannt. Upload blockiert." },
            { status: 400 }
          );
        }
      }
    }*/

    //Version Blurred

    const processed = await Promise.all(
      payload.map(async (item) => {
        if (!item.image_base64) return { ...item, image_blurred_base64: null };

        // Base64 -> Buffer
        const base64Data = item.image_base64.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");

        // Mit sharp eine Blur-Version erzeugen
        const blurredBuffer = await sharp(buffer).blur(60).toBuffer();
        const blurredBase64 = `data:image/jpeg;base64,${blurredBuffer.toString(
          "base64"
        )}`;

        return {
          ...item,
          image_blurred_base64: blurredBase64,
        };
      })
    );

    for (const [index, img] of processed.entries()) {
      if (!img.image_blurred_base64) continue;

      const existing = await db
        .select()
        .from(profilePictures)
        .where(eq(profilePictures.id, img.id));

      if (existing.length > 0) {
        await db
          .update(profilePictures)
          .set({
            imageBase64_blurred: img.image_blurred_base64,
            position: index,
            userUuid: userId,
            id: img.id,
          })
          .where(eq(profilePictures.id, img.id));
      } else {
        await db.insert(profilePictures).values({
          id: img.id,
          imageBase64_blurred: img.image_blurred_base64,
          position: index,
          userUuid: userId,
        });
      }
    }

    for (const [index, img] of payload.entries()) {
      if (!img.image_base64) continue;

      const existing = await db
        .select()
        .from(profilePictures)
        .where(eq(profilePictures.id, img.id));

      if (existing.length > 0) {
        await db
          .update(profilePictures)
          .set({
            imageBase64: img.image_base64,
            position: index,
            userUuid: userId,
            id: img.id,
          })
          .where(eq(profilePictures.id, img.id));
      } else {
        await db.insert(profilePictures).values({
          id: img.id,
          imageBase64: img.image_base64,
          position: index,
          userUuid: userId,
        });
      }
    }

    return NextResponse.json({ message: "Images saved successfully" });
  } catch (error) {
    console.error("Error saving images:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
