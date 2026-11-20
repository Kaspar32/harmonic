import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("authtoken")?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload !== "object" ||
      payload === null ||
      typeof payload.userId !== "string"
    ) {
      return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
    }

    const socketToken = jwt.sign(
      { userId: payload.userId, purpose: "socket" },
      secret,
      { expiresIn: "5m" },
    );

    return NextResponse.json({ token: socketToken });
  } catch {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 401 });
  }
}
