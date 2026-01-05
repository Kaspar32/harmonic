// server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import { db } from "../src/db";
import { messages } from "../src/db/schema";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: { origin: "http://172.24.2.170:3000", methods: ["GET", "POST"] },
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

  socket.on("join-room", (data: { room: string; user: string }) => {
    socket.join(data.room);
    console.log(`${data.user} ist dem Raum ${data.room} beigetreten.`); 

    
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


});

httpServer.listen(4001, () => console.log("Socket.IO Server läuft auf :4001"));
