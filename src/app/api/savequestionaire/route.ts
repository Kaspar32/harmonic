//Save Questions in DB
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { questionaires } from "../../../db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const uuid = searchParams.get("uuid");

   if (!uuid || uuid === "undefined") {
    return NextResponse.json(
      { error: "Invalid UUID" },
      { status: 400 }
    );
  }

  try {
    const pictures = await db
      .select()
      .from(questionaires)
      .where(eq(questionaires.uuid, uuid));
    return NextResponse.json(pictures);
  } catch (error) {
    console.error("Error fetching questionaires:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { uuid, question1, question2, question3, question4, question5, question6, question7, question8 } = body;

  const existing = await db
    .select()
    .from(questionaires)
    .where(eq(questionaires.uuid, uuid));

  if (existing.length > 0) {
    await db
      .update(questionaires)
      .set({
        answers: {
          question1,
          question2,
          question3,
          question4,
          question5,
          question6,
          question7,
          question8
        },
      })
      .where(eq(questionaires.uuid, uuid));

    return NextResponse.json({
      success: true,
      message: "Updated existing answers",
    });
  } else {
    console.log("No existing answers found, inserting new.");

    // console.log("Received answers:", { question1, question2, question3, question4, question5, question6 });

    console.log("Saving answers for user:", uuid);

    await db.insert(questionaires).values({
      uuid,
      answers: {
        question1,
        question2,
        question3,
        question4,
        question5,
        question6,
        question7,
        question8
      },
    });
    return NextResponse.json({ success: true });
  }
}
