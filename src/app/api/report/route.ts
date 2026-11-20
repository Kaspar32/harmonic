import { db } from "@/db";
import { reports } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  if (!userfromAuth) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  if (userfromAuth.roles !== "admin") {
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
  let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }

  if (!userfromAuth) {
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
      .values({ reportedId, reporterId: userfromAuth.uuid, reason })
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
