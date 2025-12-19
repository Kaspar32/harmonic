import { db } from "@/db";
import { messages } from "@/db/schema";
import { Server as IOServer, Socket } from "socket.io";
import type { NextApiResponse } from "next";

interface ChatMessage {
  content: string;
  fromUser: string;
  toUser: string;
}

export default function handler(res: NextApiResponse) {

  if (!res.socket?.server) { //überprüfung ob socke existiert
    res.status(500).end("Socket server not available");
    return;
  }

  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket: Socket) => {
      console.log("neue Verbindung:", socket.id);

      socket.on("join", (username: string) => {
        socket.join(username);
        console.log(`${username} ist dem Raum beigetreten.`);
      });

      socket.on("chat message", async (msg: ChatMessage) => {
        try {
          const [savedMsg] = await db
            .insert(messages)
            .values({
              content: msg.content,
              fromUser: msg.fromUser,
              toUser: msg.toUser,
            })
            .returning();

          const messageToSend = {
            id: savedMsg.id,
            fromUser: savedMsg.fromUser,
            toUser: savedMsg.toUser,
            content: savedMsg.content,
            createdAt: savedMsg.createdAt.toISOString(),
          };

          io.to(msg.fromUser).to(msg.toUser).emit("chat message", messageToSend);
        } catch (error) {
          console.error("Fehler beim Speichern der Nachricht:", error);
        }
      });
    });

    res.socket.server.io = io;
    console.log("Socketserver initialisiert");
  } else {
    console.log("Socket server existiert bereits");
  }

  res.end();
}
