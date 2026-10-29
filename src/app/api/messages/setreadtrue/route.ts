import {NextResponse} from "next/server";
import {db} from "@/db";
import {messages, users} from "@/db/schema";
import {and,eq} from "drizzle-orm";
export async function POST(request: Request) {
    let userfromAuth;
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (res.ok) {
      const UserData = await res.json();
      userfromAuth = UserData;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }



  try {
    const body = await request.json();
    const { chatPartner } = body;

    if (!chatPartner) {
      return NextResponse.json(
        { error: "Chatpartner required" },
        { status: 400 },
      );
    }


        // Fetching name for uuid
    const userResult = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.uuid, userfromAuth.uuid));

    if (!userResult[0]?.name) {
      return NextResponse.json({ error: "User name not found" }, { status: 404 });
    }


    //Set all Messages between to User to read: true
    await db
      .update(messages)
        .set({ read: true })
        .where(
            and(
              eq(messages.toUser, userResult[0].name),
              eq(messages.fromUser, chatPartner),
            ),
        );

    return NextResponse.json({ message: "Messages updated" }, { status: 200 });
  } catch (error) {
    console.error("Messages/setreadtrue error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}