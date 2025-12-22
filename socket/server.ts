// server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { db } from "../src/db";
import { messages } from "../src/db/schema";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  transports: ["websocket", "polling"], // WebSocket bevorzugen
});

interface ChatMessage {
  id: number;
  content: string;
  fromUser: string;
  toUser: string;
  createdAt: string;
}

io.on("connection", (socket) => {
  console.log("Neue Verbindung:", socket.id);

  socket.on("join", (username: string) => {
    socket.join(username);
    console.log("User ist im Raum getreten:", username);
  });

  socket.on("chat message", async (msg: ChatMessage) => {
    
    
    //console.log("Nachricht erhalten:", msg);

    
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


            console.log("Nachricht gespeichert:", savedMsg);

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

httpServer.listen(4001, () => console.log("Socket.IO Server läuft auf :4001"));
