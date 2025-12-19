import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db";
import { messages } from "@/db/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const allMessages = await db
      .select()
      .from(messages)
      .orderBy(messages.createdAt);

    res.status(200).json(allMessages);
  } else {
    res.status(405).end();
  }
}
