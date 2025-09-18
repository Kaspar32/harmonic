"use client";
import Image from "next/image";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../types/User";
import { io, Socket } from "socket.io-client";

export default function Chatter() {
  const [openChat, setopenChat] = useState(false);

  type Message = {
    id: number;
    fromUser: string;
    toUser: string;
    content: string;
    createdAt: string;
  };

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const [currentUser, setCurrentUser] = useState("");
  const [chatPartner, setChatPartner] = useState("");

  const [images, setImages] = useState<
    {
      id: string;
      imageBase64?: string;
      user_id?: string;
      position?: number;
    }[]
  >([]);

  const [users, setUsers] = useState<UserType[]>([]);

  async function calculateMatch() {
    const res = await fetch("/api/getuserdata");
    const data = await res.json();

    const res1 = await fetch(`/api/getmatchbyid?id=${data.uuid}`);
    const data1 = await res1.json();

    const allFirstImages = await Promise.all(
      data1.map(async (like: { to: string }) => {
        try {
          const res2 = await fetch(`/api/getpicsbyid?id=${like.to}`);
          const pics = await res2.json();
          return pics[0]; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err
          );
          return null;
        }
      })
    );

    // alert(allFirstImages[0].imageBase64);

    const validImages = allFirstImages.map((img) =>
      Boolean(img) ? img : null
    );

    setImages(validImages);

    const allUsers = await Promise.all(
      data1.map(async (like: { to: string }) => {
        try {
          const res3 = await fetch(`/api/getuserbyid?id=${like.to}`);
          const users = await res3.json();
          return users[0]; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err
          );
          return null;
        }
      })
    );

    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));

    setUsers(validUsers);
  }

  useEffect(() => {
    calculateMatch();
  }, []);

  useEffect(() => {
    const socket = io({ path: "/api/socket" });
    socketRef.current = socket;

    socket.on("chat message", (msg: Message) => {
      if (!msg.content || !msg.fromUser || !msg.toUser) {
        console.warn("Ungültige Nachricht empfangen:", msg);
        return;
      }
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    // Beim Unmouten der Funktion wird der socket disconected
    return () => {
      socket.disconnect();
    };
  }, []);

  // Beim Mounten der Komponente den User dem Socket hinzufügen
  useEffect(() => {
    const joinUser = async () => {
      if (!socketRef.current) return;

      const res = await fetch("/api/getuserdata");
      const data = await res.json();

      socketRef.current.emit("join", currentUser);
      socketRef.current.emit("setUuid", data.uuid);
    };

    joinUser();
  }, [currentUser]);

  // fetch Messages

  const fetchMessages = async () => {
    if (!socketRef.current || !currentUser || !chatPartner) return;
    // Nachrichten für den aktuellen User und Chat-Partner abrufen

    const res = await fetch("/api/messages");

    if (!res.ok) {
      console.error("Fehler beim Abrufen der Nachrichten:", res.statusText);
      return;
    }
    // Nachrichten von der API abrufen
    const data = await res.json();

    //alert("fetch Messages");
    setMessages(data);
  };

  // Senden der Message
  const sendMessage = () => {
    if (!socketRef.current || !input.trim() || !currentUser || !chatPartner)
      return;

    const message: Message = {
      id: Date.now(),
      fromUser: currentUser,
      toUser: chatPartner,
      content: input,
      createdAt: new Date().toISOString(),
    };

    socketRef.current.emit("chat message", message);

    //setMessages((prev) => [...prev, message]);
    setInput("");
  };

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInput(e.target.value);
  };

  // Auswählen der User für den Chat
  async function handleClick(index: number) {
    const res = await fetch("/api/getuserdata");
    if (!res.ok) {
      console.error("Fehler beim Abrufen der Benutzerdaten:", res.statusText);
      return;
    }

    const data = await res.json();

    if (!data || !data.name) {
      console.error("Benutzerdaten sind ungültig:", data);
      return;
    }

    setCurrentUser(data.name);
    setChatPartner(users[index].name);

    //fetch Nachrichten für den aktuellen User und Chat-Partner

    fetchMessages();

    //Pop-Up-Fenster öffnen
    setTimeout(() => {
      setopenChat(true);
    }, 100);
  }

  return (
    <div className="flex flex-wrap gap-4 ml-4 mt-4  ">
      {images.map((item, index) => (
        <div
          key={index}
          onClick={() => handleClick(index)}
          className="w-100 h-30 border-2 bg-yellow-50 border-yellow-300 rounded-2xl p-4 flex shadow-sm active:inset-shadow-sm/50 inset-shadow-black "
        >
          <Image
            src={item.imageBase64 || "/images/default-profile.png"}
            height={70}
            width={80}
            className="rounded-4xl border-2 border-yellow-300 "
            alt="Profilbild"
          />

          <p className="flex text-xl font-bold text-yellow-500 items-center ml-4">
            {users[index]?.name || ""}
          </p>

          <Image
            src="/images/keyboard.svg"
            height={10}
            width={40}
            className="relative left-20 mt-10 hover:rotate-20 hover:scale-150 transition-transform duration-300 "
            alt="Profilbild"
          />
        </div>
      ))}

      {openChat && (
        <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 ">
          <div className="bg-white p-6 rounded-2xl shadow-lg flex-1 h-[90%] w-[90%] text-yellow-400 ">
            <div className="overflow-y-auto p-4 space-y-4">
              {messages
                .filter(
                  (msg) =>
                    (msg.fromUser === currentUser &&
                      msg.toUser === chatPartner) ||
                    (msg.fromUser === chatPartner && msg.toUser === currentUser)
                )
                .map((msg) => {
                  const isCurrentUser = msg.fromUser === currentUser;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-2 rounded-lg ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <span className="block text-xs text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString("de-DE", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Eingabefeld */}
            <div className="flex fixed bottom-25 left-5 w-[60%] h-10 items-center justify-center">
              <textarea
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="w-full text-2xl pl-3 pt-3 border-3 border-yellow-500 rounded-2xl focus:outline-none"
              ></textarea>
            </div>

            <button
              className="fixed top-10 right-4 mt-6 px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-200 transition-colors duration-300"
              onClick={() => {
                setopenChat(false);
              }}
            >
              X
            </button>

            <button
              className="fixed  bottom-19 right-5 md:bottom-15 md:right-120 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition-colors duration-300"
              onClick={sendMessage}
            >
              Senden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
