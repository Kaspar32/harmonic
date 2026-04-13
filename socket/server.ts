// server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { db } from "../src/db/index.ts";
import { messages } from "../src/db/schema.ts";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://195.15.205.186:3000",
      "http://localhost:3000",
      "http://harmonic.jcloud.ik-server.com:3000/",
    ],
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // WebSocket bevorzugen
});

interface ChatMessage {
  id: number;
  content: string;
  fromUser: string;
  toUser: string;
  createdAt: string;
}

const onlineUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log("Neue Verbindung:", socket.id);

  socket.on("user-connect", (data: { userId: string }) => {
    const userId = data.userId;
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);
    console.log(`${userId} verbunden`);
    io.emit("user-online", { userId, online: true });
  });

  socket.on("join-room", (data: { room: string; user: string }) => {
    socket.join(data.room);
    console.log(`${data.user} ist dem Raum ${data.room} beigetreten.`);

    const userId = data.user;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId)!.add(socket.id);

    io.emit("user_online", userId);

  });

  socket.on("chat message", async (msg: ChatMessage) => {
    try {
      const [savedMsg] = await db
        .insert(messages)
        .values({
          content: msg.content,
          fromUser: msg.fromUser,
          toUser: msg.toUser,
          createdAt: new Date(msg.createdAt),
        })
        .returning();

      const messageToSend = {
        id: savedMsg.id,
        fromUser: savedMsg.fromUser,
        toUser: savedMsg.toUser,
        content: savedMsg.content,
        createdAt: savedMsg.createdAt.toISOString(),
      };

      console.log("Nachricht weiterleiten:", messageToSend);
      io.emit("chat message", messageToSend);
    } catch (error) {
      console.error("Fehler beim Speichern der Nachricht:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnect:", socket.id);

    for (const [userId, sockets] of onlineUsers.entries()) {
      sockets.delete(socket.id);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`${userId} ist offline`);
        io.emit("user-online", { userId, online: false });
      }
    }
  });
});

httpServer.listen(4001, () => console.log("Socket.IO Server läuft auf :4001"));
