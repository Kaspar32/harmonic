"use client";
import Image from "next/image";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../types/User";
import { io, Socket } from "socket.io-client";
import Popup from "./popup";
import { Loader2 } from "lucide-react";
import { messagesAtom } from "@/lib/overgivenotifications";
import { useAtom } from "jotai";
import { boolean } from "drizzle-orm/gel-core";
import ProfileSingleView from "./profile_single_view";

export default function Chatter() {
  const [openChat, setopenChat] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(-1);
  const [unlike, setUnlike] = useState(false);

  const [loading, setLoading] = useState(true);

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
      user_id: string;
      image_path: string;
    }[]
  >([]);

  const [Allimages, setAllImages] = useState<{ image_path: string[]; user_id: string }>();

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
          const res2 = await fetch(`/api/getfirstpicbyuserid?id=${like.to}`);
          const pics = await res2.json();
          return pics;
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err,
          );
          return null;
        }
      }),
    );

    //alert(allFirstImages[0].imageBase64);

    const validImages = allFirstImages.map((img) =>
      Boolean(img) ? img : null,
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
            err,
          );
          return null;
        }
      }),
    );

    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));

    setUsers(validUsers);
  }

  //Beim Rendern der Page ausführen
  useEffect(() => {
    setLoading(true);
    calculateMatch();
    setLoading(false);
  }, []);

  //Beim Rendern der Page ausführen damit ein neuer Socket erstellt wird :::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    const socket = io("http://195.15.205.186:4001", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Verbunden mit Socket-Server:", socket.id);
    });

    socketRef.current = socket;

    socket.on("chat message", (msg: Message) => {
      if (!msg.content || !msg.fromUser || !msg.toUser) {
        console.warn("Ungültige Nachricht empfangen:", msg);
      }
      console.log("Nachricht empfangen im Client:", msg);
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

  // Beim Mounten der Komponente den User dem Raum hinzufügen:::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    if (!socketRef.current || !currentUser) return;

    socketRef.current.emit("join-room", {
      room: "test-room",
      user: currentUser,
    });
  }, [currentUser]);

  const fetchMessages = async () => {
    if (!socketRef.current || !currentUser || !chatPartner) return;
    // Nachrichten für den aktuellen User und Chat-Partner abrufen

    const res = await fetch(`/api/messages?chatPartner=${chatPartner}`);

    if (!res.ok) {
      console.error("Fehler beim Abrufen der Nachrichten:", res.statusText);
      return;
    }
    // Nachrichten von der API abrufen
    const data = await res.json();
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
    if (!socketRef.current || !input.trim() || !currentUser || !chatPartner)
      return;

    const message: Message = {
      id: Date.now(),
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

  // Auswählen der User für den Chat::::::::::::::::::::::::::::::::::::::::::::::::
  async function handleClick(index: number) {
    newMessages[index] = false;

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

  // Löschen oder blockieren von ChatPartner::::::::::::::::::::::::::::::::::::::::::::::

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

  // Beim Clicken auf das Profil ein neues Fenster mit dem Profildaten:::::::::::::::::::::

  function handlePPClick(index: number) {
    setopenChat(false);
    setSelectedProfileIndex(index);
    setOpenProfile(true);
  }

  useEffect(() => {
    const chatWindow = document.getElementById("chatmessagewindow");
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [messages, openChat]);

  // Notifications für die Messages
  const newMessages: boolean[] = [];
  const [newmessagesusers] = useAtom(messagesAtom);

  for (let j = 0; j <= newmessagesusers.length - 1; j++) {
    const userIndex = users.findIndex((u) => u.name === newmessagesusers[j]);
    newMessages[userIndex] = true;
  }

  console.log("Neue Nachricht von:", newmessagesusers[0]);

  return (
    <div className="flex flex-wrap gap-4 ml-4 mt-4 h-full overflow-y-auto ">
      {loading && <Loader2 className=" animate-spin text-yellow-400" />}
      {!loading && (
        <div className="sm:flex sm:flex-wrap sm:gap-4 m-2 w-screen">
          {images.map((item, index) => (
            <div key={index}>
              <div
                className={
                  "relative cursor-pointer w-full mb-4 sm:mb-0 sm:w-60 lg:w-90 h-30 border-2 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 rounded-2xl p-4 flex shadow-sm active:inset-shadow-sm/50 inset-shadow-black"
                }
              >
                <Image
                  src={
                    item?.image_path
                      ? `/images/${item.image_path}`
                      : "/images/defaultProfile.png"
                  }
                  height={70}
                  width={80}
                  className="rounded-4xl border-2 border-yellow-300 "
                  alt="Profilbild"
                  onClick={() => handlePPClick(index)}
                />

                <p
                  className="flex text-xl font-bold text-yellow-500 items-center ml-4"
                  onClick={() => handleClick(index)}
                >
                  Schreibe:... {users[index]?.name || ""}
                </p>

                {newMessages[index] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 text-red-700 mt-15 ml-10 animate-bounce"
                  >
                    <path d="M19.5 22.5a3 3 0 0 0 3-3v-8.174l-6.879 4.022 3.485 1.876a.75.75 0 1 1-.712 1.321l-5.683-3.06a1.5 1.5 0 0 0-1.422 0l-5.683 3.06a.75.75 0 0 1-.712-1.32l3.485-1.877L1.5 11.326V19.5a3 3 0 0 0 3 3h15Z" />
                    <path d="M1.5 9.589v-.745a3 3 0 0 1 1.578-2.642l7.5-4.038a3 3 0 0 1 2.844 0l7.5 4.038A3 3 0 0 1 22.5 8.844v.745l-8.426 4.926-.652-.351a3 3 0 0 0-2.844 0l-.652.351L1.5 9.589Z" />
                  </svg>
                )}

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
      )}

      {openChat && (
        <div className="fixed inset-0 flex items-center justify-center w-screen h-screen  bg-white/90">
          <div
            id="chatmessagewindow"
            className="max-h-[600px] space-y-4 overflow-x-hidden mb-4"
          >
            <div className="w-screen h-full p-4 md:p-10">
              {messages
                .filter(
                  (msg) =>
                    (msg.fromUser === currentUser &&
                      msg.toUser === chatPartner) ||
                    (msg.fromUser === chatPartner &&
                      msg.toUser === currentUser),
                )
                .map((msg) => {
                  const isCurrentUser = msg.fromUser === currentUser;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${
                        isCurrentUser
                          ? "flex justify-end"
                          : "flex justify-start"
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
            </div>
          </div>

          {/* Eingabefeld */}
          <div className="fixed bottom-30 left-5 right-5 flex items-center gap-2">
            <input
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 text-2xl pt-1 mr-15 border-3 border-yellow-500 rounded-2xl focus:outline-none z-50"
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

      {openProfile && (

        
        <Popup onClose={() => setOpenProfile(false)} bgColor="bg-yellow-50">

          <ProfileSingleView selectedProfileIndex={1} />

          
        </Popup>
        
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
            </button>
          </div>
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
