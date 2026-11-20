// server.ts
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { db } from "../src/db/index.ts";
import { likes, messages, users } from "../src/db/schema.ts";
import { and, eq } from "drizzle-orm";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://195.15.205.186:3000",
      "http://localhost:3000",
      "https://harmonic.jcloud.ik-server.com",
    ],
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // WebSocket bevorzugen
});

interface ChatMessageInput {
  content: string;
  toUser: string;
}

const onlineUsers = new Map<string, Set<string>>();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return next(new Error("Nicht authentifiziert"));
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload !== "object" ||
      payload === null ||
      payload.purpose !== "socket" ||
      typeof payload.userId !== "string"
    ) {
      return next(new Error("Ungültiger Socket-Token"));
    }

    socket.data.userId = payload.userId;
    next();
  } catch {
    next(new Error("Ungültiger Socket-Token"));
  }
});

io.on("connection", (socket) => {
  console.log("Neue Verbindung:", socket.id);
  const userId = socket.data.userId as string;
  const userRoom = `user:${userId}`;

  socket.join(userRoom);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socket.id);

  io.emit("online_users", Array.from(onlineUsers.keys()));
  io.emit("user-online", { userId, online: true });

  socket.on("chat message", async (msg: ChatMessageInput) => {
    try {
      if (
        !msg ||
        typeof msg.content !== "string" ||
        typeof msg.toUser !== "string" ||
        !msg.content.trim() ||
        msg.content.length > 2000
      ) {
        socket.emit("chat error", "Ungültige Nachricht");
        return;
      }

      const [sender] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.uuid, userId))
        .limit(1);

      const [recipient] = await db
        .select({ uuid: users.uuid, name: users.name })
        .from(users)
        .where(eq(users.name, msg.toUser))
        .limit(1);

      if (!sender?.name || !recipient?.name) {
        socket.emit("chat error", "Chatpartner nicht gefunden");
        return;
      }

      const [outgoingLike] = await db
        .select({ id: likes.id })
        .from(likes)
        .where(and(eq(likes.from, userId), eq(likes.to, recipient.uuid)))
        .limit(1);

      const [incomingLike] = await db
        .select({ id: likes.id })
        .from(likes)
        .where(and(eq(likes.from, recipient.uuid), eq(likes.to, userId)))
        .limit(1);

      if (!outgoingLike || !incomingLike) {
        socket.emit("chat error", "Kein gültiger Match");
        return;
      }

      const [savedMsg] = await db
        .insert(messages)
        .values({
          content: msg.content.trim(),
          fromUser: sender.name,
          toUser: recipient.name,
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
      io.to(`user:${userId}`).to(`user:${recipient.uuid}`).emit("chat message", messageToSend);
    } catch (error) {
      console.error("Fehler beim Speichern der Nachricht:", error);
      socket.emit("chat error", "Nachricht konnte nicht gespeichert werden");
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnect:", socket.id);

    const sockets = onlineUsers.get(userId);
    sockets?.delete(socket.id);

    if (sockets?.size === 0) {
      onlineUsers.delete(userId);
      console.log(`${userId} ist offline`);
      io.emit("user-online", { userId, online: false });
    }
  });
});

httpServer.listen(4001, () => console.log("Socket.IO Server läuft auf :4001"));
