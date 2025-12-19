"use client";
import Image from "next/image";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../types/User";
import { io, Socket } from "socket.io-client";
import Popup from "./popup";
import { getImageSrc } from "@/lib/getImageSrc";

export default function Chatter() {
  const [openChat, setopenChat] = useState(false);
  const [unlike, setUnlike] = useState(false);

  type Message = {
    tempId: number;
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

  //Laden der Profilbilder und ChatPartner-Namen

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

  //Beim Rendern der Page ausführen
  useEffect(() => {
    calculateMatch();
  }, []);

  //Beim Rendern der Page ausführen
  useEffect(() => {

    
    
    const socket = io("http://localhost:4001", {
  transports: ["websocket"]
});
    
    
    socket.on("connect", () => {
    console.log("Verbunden mit Socket-Server:", socket.id);
    });

 
  
    socketRef.current = socket;

    console.log("Socket"+socket);
    socket.on("chat message", (msg: Message) => {
      if (!msg.content || !msg.fromUser || !msg.toUser) {
        console.warn("Ungültige Nachricht empfangen:", msg);
        return;
      }
      setMessages((prev) => {
        const exists = prev.some((m) => m.tempId === msg.tempId);
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
      socketRef.current.emit("join", currentUser);
    };

    joinUser();
  }, [currentUser]);

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
  
  // fetch Messages beim ändern von CurrentUser und chatPartner
  useEffect(() => {
    if (currentUser && chatPartner) {
      fetchMessages();
    }
  }, [currentUser, chatPartner]);

  // Senden der Message
  const sendMessage = () => {

    alert("test"+input);
    if (!socketRef.current || !input.trim() || !currentUser || !chatPartner)
      return;

    const message: Message = {
      tempId: Date.now(),
      content: input,
      fromUser: currentUser,
      toUser: chatPartner,
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

    //Pop-Up-Fenster öffnen
    setTimeout(() => {
      setopenChat(true);
    }, 100);
  }

  // Löschen oder blockieren von ChatPartner

  const [selectedIndex, setSelectedIndex] = useState(-1);

  async function handleunmatch() {
    //alert("test"+selectedIndex);
    // alert("test"+users[selectedIndex].name);

    const res = await fetch("/api/getuserdata");
    if (!res.ok) {
      console.error("Fehler beim Abrufen der Benutzerdaten:", res.statusText);
      return;
    }

    const data = await res.json();

    //Like löschen

    const payload = { from: data.uuid, to: users[selectedIndex].uuid };
    await fetch("/api/deletelikebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    calculateMatch();
  }

  async function handleblock() {
    const res = await fetch("/api/getuserdata");
    if (!res.ok) {
      console.error("Fehler beim Abrufen der Benutzerdaten:", res.statusText);
      return;
    }

    const data = await res.json();

    //Blockieren ist gleich wie like löschen und disliken

    const payload = { from: data.uuid, to: users[selectedIndex].uuid };

    await fetch("/api/deletelikebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await fetch("/api/adddislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    calculateMatch();
  }

  function handleCross(index: number) {
    setSelectedIndex(index);
    setUnlike(true);
  }

  const [report, setReport] = useState(false);
  const [reason, setReason] = useState<string>("unangemessenes_verhalten");

  async function handleReport() {
   // alert("Benutzer wurde gemeldet" + users[selectedIndex].name);

    const res = await fetch("/api/getuserdata");
    if (!res.ok) {
      console.error("Fehler beim Abrufen der Benutzerdaten:", res.statusText);
      return;
    }

    const data = await res.json();

    //Zuerst Blockieren ist gleich wie like löschen und disliken

    const payload = { from: data.uuid, to: users[selectedIndex].uuid };

    await fetch("/api/deletelikebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await fetch("/api/adddislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    calculateMatch();

    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportedId: users[selectedIndex].uuid,
        reporterId: data.uuid,
        reason,
      }),
    });
  }

  return (
    <div className="flex flex-wrap gap-4 ml-4 mt-4 h-full overflow-y-auto ">
      <div className="sm:flex sm:flex-wrap sm:gap-4 m-2 w-screen">
        {images.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => handleClick(index)}
              className="relative cursor-pointer w-full mb-4 sm:mb-0 sm:w-60 lg:w-90 h-30 border-2 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 rounded-2xl p-4 flex shadow-sm active:inset-shadow-sm/50 inset-shadow-black "
            >
              <Image
                src={
                  item?.imageBase64
                    ? getImageSrc(item.imageBase64)
                    : "/images/defaultProfile.png"
                }
                height={70}
                width={80}
                className="rounded-4xl border-2 border-yellow-300 "
                alt="Profilbild"
              />

              <p className="flex text-xl font-bold text-yellow-500 items-center ml-4">
                {users[index]?.name || ""}
              </p>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="cursor-pointer size-6 text-red-300 border-2 hover:text-red-500 border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 rounded-full absolute top-[-4] right-[-4]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCross(index);
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {openChat && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] w-screen h-screen bg-white">
            <div className="max-h-[600px] space-y-4 overflow-x-hidden mb-4">

              <div className="w-screen h-full p-4 md:p-10">

              
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
                      key={msg.tempId}
                      className={`flex mb-2 ${
                        isCurrentUser ? "flex justify-end" : "flex justify-start"
                      }`}
                    >
                      <div
                        className={` min-w-[200px] max-w-[400px] p-2 rounded-lg  ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none w-max"
                            : "bg-gray-200 text-black rounded-bl-none w-max"
                        }`}
                      >
                        <p className="text-sm text-clip">{msg.content}</p>
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
            </div></div>

            {/* Eingabefeld */}
            <div className="fixed bottom-24 left-5 right-5 flex items-center gap-2">
              <input
                value={input}
                onChange={handleChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 text-2xl pt-1 mr-15 border-3 border-yellow-500 rounded-2xl focus:outline-none"
              />

              <button
                className="absolute right-[-5px] bg-yellow-500 text-white px-4 py-2 rounded-2xl transition-colors duration-300"
                onClick={sendMessage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 text-black"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>

            <button
              className="fixed top-15 right-4 sm:top-23 sm:right-4 mt-6 px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-200 transition-colors duration-300"
              onClick={() => {
                setopenChat(false);
              }}
            >
              X
            </button>
         
        </div>
      )}

      {unlike && (
        <Popup onClose={() => setUnlike(false)}>
          <div className="flex gap-2 mt-8">

          <button
            onClick={() => {
              handleunmatch();
              setUnlike(false);
            }}
            className="px-4 py-2 bg-yellow-400 text-white font-semibold rounded-2xl hover:bg-yellow-500 w-full"
          >
            Unmatchen
          </button>

          <button
            onClick={() => {
              handleblock();
              setUnlike(false);
            }}
            className=" px-4 py-2 bg-red-100 text-red-500 font-semibold rounded-2xl hover:bg-red-200 w-full"
          >
            Blockieren
          </button>

          <button
            onClick={() => {
              setUnlike(false);
              setReport(true);
            }}
            className=" px-4 py-2 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 w-full"
          >
            Melden
          </button></div>
        </Popup>
      )}

      {report && (
        <Popup onClose={() => setReport(false)}>

          <p className="text-yellow-500 text-lg mt-8">
            Bitte wählen Sie einen Grund für die Meldung aus:
          </p>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-4 p-2 border-2 text-red-300 border-yellow-300 rounded-lg w-full"
          >
            <option value="unangemessenes_verhalten">
              Unangemessenes Verhalten
            </option>
            <option value="spam">Spam</option>
            <option value="belastigung">Belästigung</option>
          </select>

          <button
            onClick={() => {
              handleReport();
              setReport(false);
            }}
            className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-2xl hover:bg-red-600 w-full"
          >
            Melden
          </button>
        </Popup>
      )}
    </div>
  );
}
