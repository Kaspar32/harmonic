
import { db } from "@/db";
import { messages } from "@/db/schema";

export default async function handler(req: { method: string; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { id: number; content: string; fromUser: string; toUser: string; createdAt: Date; }[]): void; new(): any; }; end: { (): void; new(): any; }; }; }) {
  if (req.method === "GET") {
    const allMessages = await db.select().from(messages).orderBy(messages.createdAt);
    res.status(200).json(allMessages);
  } else {
    res.status(405).end();
  }
}