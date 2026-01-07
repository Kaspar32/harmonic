"use client";
import Image from "next/image";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../types/User";
import { io, Socket } from "socket.io-client";
import Popup from "./popup";
import { getImageSrc } from "@/lib/getImageSrc";
import ImageStack from "./shuffler";
import dotenv from "dotenv";

export default function Chatter() {
  const [openChat, setopenChat] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(-1);
  const [unlike, setUnlike] = useState(false);

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

  const [Allimages, setAllImages] = useState<
    (
      | {
          id: string;
          imageBase64?: string;
          user_id?: string;
          position?: number;
        }[]
      | null
    )[]
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


    //Alle Bilder für ImageStack für die Profileansicht laden
    const allImages = await Promise.all(
      data1.map(async (like: { to: string }) => {
        try {
          const res2 = await fetch(`/api/getpicsbyid?id=${like.to}`);
          const pics = await res2.json();
          return pics; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err
          );
          return null;
        }
      })
    );

    setAllImages(allImages);

    //alert(allFirstImages[0].imageBase64);

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

  // Beim Mounten der Komponente den User dem Raum hinzufügen
  useEffect(() => {
  if (!socketRef.current || !currentUser) return;

  socketRef.current.emit("join-room", {
    room: "test-room",
    user: currentUser
  });
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
    //alert("test");

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

  function handlePPClick(index: number) {
    alert("Profil von " + users[index]?.name);
    //window.location.href = `/home`;
    setopenChat(false);
    setSelectedProfileIndex(index);
    //setOpenProfile(true);
  }


  useEffect(() => {
    const chatWindow = document.getElementById("chatmessagewindow"); 
    if(chatWindow)
    {
      chatWindow.scrollTop=chatWindow.scrollHeight;
    }
  },[messages]);


  return (
    <div className="flex flex-wrap gap-4 ml-4 mt-4 h-full overflow-y-auto ">
      <div className="sm:flex sm:flex-wrap sm:gap-4 m-2 w-screen">
        {images.map((item, index) => (
          <div key={index}>
            <div className="relative cursor-pointer w-full mb-4 sm:mb-0 sm:w-60 lg:w-90 h-30 border-2 bg-yellow-50 hover:bg-yellow-100 border-yellow-300 rounded-2xl p-4 flex shadow-sm active:inset-shadow-sm/50 inset-shadow-black ">
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
                onClick={() => handlePPClick(index)}
              />

              <p
                className="flex text-xl font-bold text-yellow-500 items-center ml-4"
                onClick={() => handleClick(index)}
              >
               Schreibe:... {users[index]?.name || ""}
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
        <div className="fixed inset-0 flex items-center justify-center w-screen h-screen bg-white">
          <div id="chatmessagewindow"className="max-h-[600px] space-y-4 overflow-x-hidden mb-4">
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
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-yellow-600">
              <p className="text-yellow-500">
                {users[selectedProfileIndex]?.name}
              </p>
            </h2>

            <div className="flex gap-4 mb-4">
              {selectedProfileIndex >= 0 && (
                <ImageStack images={Allimages[selectedProfileIndex] || []} />
              )}

               <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 text-yellow-600"
            >
              <path
                d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z"
              />
            </svg>
            </div>

           

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">Geschlecht:</span>{" "}
              {users[selectedProfileIndex]?.geschlecht}
            </p>

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">Alter:</span>{" "}
              {users[selectedProfileIndex]?.alter}
            </p>

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">Grösse (cm):</span>{" "}
              {users[selectedProfileIndex]?.groesse}
            </p>

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">Musikgeneres:</span>{" "}
              {users[selectedProfileIndex]?.genres.join(", ")}
            </p>

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">
                Lieblingslied:
              </span>
              <div className="border-3 rounded-3xl border-yellow-500 py-1 px-3 text-center  break-normal">
                {users[selectedProfileIndex]?.favorite_track ? (
                  <div className="flex items-center gap-1">
                    <Image
                      src={
                        users[selectedProfileIndex]?.favorite_track?.image ||
                        "/images/Home.png"
                      }
                      alt="Album Cover"
                      height={30}
                      width={30}
                      style={{ objectFit: "cover" }} // schneidet es sauber zu
                      quality={100}
                    />
                    <div className="md:w-full max-w-[120px]">
                      <p className="font-semibold text-yellow-500">
                        {users[selectedProfileIndex]?.favorite_track?.name}
                      </p>
                      <p className="text-sm text-yellow-500">
                        {users[selectedProfileIndex]?.favorite_track?.artist}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Keine daten</p>
                )}
              </div>
            </p>

            <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl shadow-2xl p-2">
              <span className="font-semibold text-gray-400">
                Lieblingsinterpret:
              </span>{" "}
              <div className="border-3 border-yellow-500 rounded-3xl py-1 px-3 text-center  break-normal">
                {users[selectedProfileIndex]?.favorite_artist ? (
                  <div className="flex items-center gap-1 ">
                    <Image
                      src={
                        users[selectedProfileIndex]?.favorite_artist?.image ||
                        "/images/Home.png"
                      }
                      alt="Lieblingsinterpret Bild"
                      height={30}
                      width={30}
                      style={{ objectFit: "cover" }} // schneidet es sauber zu
                      quality={100}
                    />
                    <div className="md:w-full max-w-[120px]">
                      <p className="font-semibold text-yellow-500">
                        {users[selectedProfileIndex]?.favorite_artist?.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>Keine daten</p>
                )}
              </div>
            </p>
          </div>
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
