import { db } from "@/db";
import { reports } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allReports = await db.select().from(reports);
    return NextResponse.json({ success: true, reports: allReports });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}   

export async function POST(req: Request) {
  try {
    const { reportedId, reporterId, reason } = await req.json();

    const [report] = await db
      .insert(reports)
      .values({ reportedId, reporterId, reason })
      .returning();

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}