import { db} from "@/db";
import { eq } from "drizzle-orm";
import { reports } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { users } from "@/db/schema"; 
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }


  // Rolle aus DB abrufen (da userfromAuth nur uuid hat, nicht roles)
  const [dbUser] = await db
    .select({ roles: users.roles })
    .from(users)
    .where(eq(users.uuid, userId));

  if (dbUser?.roles !== "admin") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  try {
    const allReports = await db.select().from(reports);
    return NextResponse.json({ success: true, reports: allReports });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {

  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }


  try {
    const { reportedId, reason } = await req.json();

    if (!reportedId || !reason) {
      return NextResponse.json(
        { error: "Benutzer und Grund sind erforderlich" },
        { status: 400 },
      );
    }

    const [report] = await db
      .insert(reports)
      .values({ reportedId, reporterId: userId, reason })
      .returning();

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 },
    );
  }
}
