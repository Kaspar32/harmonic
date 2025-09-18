// pages/api/socket.js
import { db } from "@/db";
import { likes, messages } from "@/db/schema";
import { Server } from "socket.io";
import { eq, and, inArray, cosineDistance, max } from "drizzle-orm"; // Adjust the import path if needed

export default function handler(res: any) {
  console.log("Test Nachricht");

  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", async (socket) => {
      console.log("🔌 Neue Verbindung:", socket.id);
      let currentUser: any;
      socket.on("join", (username) => {
        socket.join(username);
        currentUser = username; // User tritt einem Raum mit seinem Namen bei
        console.log(`${username} ist dem Raum beigetreten.`);
      });

      socket.on("chat message", async (msg) => {
        const { content, fromUser, toUser } = msg;

        console.log("📩 Test Nachricht:", msg);

        try {
          const [savedMsg] = await db
            .insert(messages)
            .values({ content: content, fromUser, toUser })
            .returning();
          const messageToSend = {
            id: savedMsg.id,
            fromUser: savedMsg.fromUser,
            toUser: savedMsg.toUser,
            content: savedMsg.content,
            createdAt: savedMsg.createdAt.toISOString(),
          };

          io.to(msg.fromUser)
            .to(msg.toUser)
            .emit("chat message", messageToSend);
        } catch (error) {
          console.error("Fehler beim Speichern der Nachricht:", error);
        }
        //await db.insert()
        // Nachricht an beide Räume (Sender und Empfänger) senden
      });

    });

    res.socket.server.io = io;
  }
  res.end();
}
