"use client";
import Image from "next/image";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { UserType } from "../types/User";
import { io, Socket } from "socket.io-client";
import Popup from "./popup";
import { Loader2, Music, Send, X } from "lucide-react";
import ProfileSingleView from "./profile_single_view";
import Superlike from "./superlike";
import { useNotification } from "../context/NotificationContext";
import { useUser } from "../context/UserContext";

export default function Chatter() {
  const [openChat, setopenChat] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(-1);
  const [unlike, setUnlike] = useState(false);
  const [openSuperlikeProfile, setOpenSuperlikeProfile] = useState(false);
  const [selectedSuperlikeUser, setSelectedSuperlikeUser] =
    useState<UserType | null>(null);
  const { user } = useUser();

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
  const [chatError, setChatError] = useState("");
  const socketRef = useRef<Socket | null>(null);

  const [currentUser, setCurrentUser] = useState("");
  const [chatPartner, setChatPartner] = useState("");

  const [images, setImages] = useState<
    {
      user_id: string;
      image_path: string;
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
    let cancelled = false;

    async function loadMatches() {
      setLoading(true);
      try {
        await calculateMatch();
      } catch (error) {
        if (!cancelled) console.error("Matches konnten nicht geladen werden:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMatches();
    return () => {
      cancelled = true;
    };
  }, []);

  //Beim Rendern der Page ausführen damit ein neuer Socket erstellt wird :::::::::::::::::::::::::::::::::::::
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    let socket: Socket | null = null;

    async function connectSocket() {
      const response = await fetch("/api/auth/socket-token", {
        method: "POST",
      });

      if (!response.ok || cancelled) {
        return;
      }

      const { token } = await response.json();
      if (!token || cancelled) {
        return;
      }

      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Verbunden mit Socket-Server:", socket?.id);
      });

      socket.on("connect_error", (error) => {
        setChatError("Chat konnte nicht verbunden werden: " + error.message);
        console.error("Socket-Authentifizierung fehlgeschlagen:", error.message);
      });

      socket.on("chat message", (msg: Message) => {
        if (!msg.content || !msg.fromUser || !msg.toUser) {
          return;
        }

        setMessages((prev) => {
          const exists = prev.some((message) => message.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
      });

      socket.on("chat error", (error: string) => {
        setChatError(error);
        console.error("Chatfehler:", error);
      });

      socket.on("online_users", (userIds: string[]) => {
        setOnlineUsers(new Set(userIds));
      });

      socket.on("user-online", (data: { userId: string; online: boolean }) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          if (data.online) {
            updated.add(data.userId);
          } else {
            updated.delete(data.userId);
          }
          return updated;
        });
      });
    }

    connectSocket().catch((error) => {
      if (!cancelled) {
        console.error("Socket konnte nicht verbunden werden:", error);
      }
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

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

    setChatError("");
    socketRef.current.emit("chat message", {
      content: input.trim(),
      toUser: chatPartner,
    });

    //setMessages((prev) => [...prev, message]);
    setInput("");
  };

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setInput(e.target.value);
  };

  // Auswählen der User für den Chat::::::::::::::::::::::::::::::::::::::::::::::::
  async function handleClick(index: number) {
    setNewMessages((prev) => {
      const updated = [...prev];
      updated[index] = false;
      return updated;
    });

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
    setChatError("");

    //Pop-Up-Fenster öffnen
    setTimeout(() => {
      setopenChat(true);
    }, 100);

    // Set read auf true in DB für die Messages von diesem ChatPartner::::::::::::::::::::::::::::::::::::::::::::::::
    await fetch(`/api/messages/setreadtrue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatPartner: users[index].name
      })
    });



  }

  // Löschen oder blockieren von ChatPartner::::::::::::::::::::::::::::::::::::::::::::::

  const [selectedIndex, setSelectedIndex] = useState(-1);

  async function handleunmatch() {
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

    const payload2 = { from: users[selectedIndex].uuid, to: data.uuid };
    await fetch("/api/deletelikebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
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

    const payload2 = { from: users[selectedIndex].uuid, to: data.uuid };

    await fetch("/api/deletelikebyid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
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

  const { notifications } = useNotification();
  const [newMessages, setNewMessages] = useState<boolean[]>([]);

  // Initialize newMessages array when users change
  useEffect(() => {
    const newMsgArray: boolean[] = [];
    for (let j = 0; j < notifications.length; j++) {
      const userIndex = users.findIndex(
        (u) => u.name === notifications[j].from,
      );
      if (userIndex !== -1) {
        newMsgArray[userIndex] = true;
      }
    }
    setNewMessages(newMsgArray);
  }, [notifications, users]);

  //console.log("Neue Nachricht von:", newmessagesusers[0]);

  // Anfangsnachricht schicken in chatter, wenn gleiche Genres
  const { sameTasteNotifications } = useNotification();
  const [sameTasteMessages, setSameTasteMessages] = useState<boolean[]>([]);
  useEffect(() => {
    const newMsgArray: boolean[] = [];
    for (let j = 0; j < sameTasteNotifications.length; j++) {
      const userIndex = users.findIndex(
        (u) => u.uuid === sameTasteNotifications[j].to,
      );

      if (userIndex !== -1) {
        newMsgArray[userIndex] = true;
      }
    }
    setSameTasteMessages(newMsgArray);
  }, [sameTasteNotifications, users]);

  const defaultMessage =
    "Wir hören beide die gleichen Genre, hast du ein Lieblingskünstler?";
  useEffect(() => {
    setInput("");
    sameTasteMessages.forEach((hasSameTaste, index) => {
      if (hasSameTaste && users[index].name === chatPartner) {
        setInput(defaultMessage);
      }
    });
  }, [chatPartner, currentUser, sameTasteNotifications, users]);

  // kleine animation beim laden der Page::::::::::::::::::::::::::::::::::::::
  const [animateindex, setAnimateindex] = useState(0);

  useEffect(() => {
    if (!loading || images.length === 0) return;

    const interval = setInterval(() => {
      setAnimateindex((prev) => (prev + 1) % images.length);
    }, 200);

    return () => clearInterval(interval);
  }, [loading, images.length]);

  return (
    <div className="min-h-full overflow-y-auto px-3 py-4 sm:px-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        {loading && (
          <div className="flex min-h-32 items-center justify-center rounded-2xl border-2 border-yellow-200 bg-yellow-50 text-yellow-500 shadow-sm">
            <Loader2 className="mr-2 size-6 animate-spin" aria-hidden="true" />
            <span>Matches werden geladen ...</span>
          </div>
        )}

        {!loading && (
          <Superlike
            onImageClick={(selectedUser) => {
              setSelectedSuperlikeUser(selectedUser);
              setOpenSuperlikeProfile(true);
            }}
          />
        )}

        {!loading && images.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 px-5 py-10 text-center shadow-sm">
            <p className="text-lg font-bold text-yellow-500">Noch keine Matches</p>
            <p className="mt-1 text-sm text-gray-500">
              Sobald jemand deinen Musikgeschmack teilt, erscheint der Chat hier.
            </p>
          </div>
        )}
      {!loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((item, index) => (
            <div key={users[index]?.uuid ?? index}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Chat mit ${users[index]?.name || "Match"} öffnen`}
                className={`${index === animateindex ? "bg-yellow-100" : "bg-yellow-50"} group relative flex min-h-32 w-full cursor-pointer items-center gap-3 rounded-2xl border-2 border-yellow-300 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-yellow-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 active:shadow-inner`}
                onClick={() => handleClick(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleClick(index);
                  }
                }}>
                <Image
                  unoptimized
                  src={
                    item?.image_path
                      ? `/images/${item.image_path}`
                      : "/images/defaultProfile.png"
                  }
                  height={70}
                  width={80}
                  className="size-16 shrink-0 rounded-full border-2 border-yellow-300 object-cover sm:size-[72px]"
                  alt="Profilbild"
                  onClick={(e) => {e.stopPropagation();handlePPClick(index)}}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-yellow-500">
                    {users[index]?.name || "Unbekanntes Match"}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`size-2 rounded-full ${onlineUsers.has(users[index]?.uuid) ? "bg-green-500" : "bg-gray-400"}`} aria-hidden="true" />
                    <span className={onlineUsers.has(users[index]?.uuid) ? "text-green-600" : "text-gray-500"}>
                      {onlineUsers.has(users[index]?.uuid) ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                {newMessages[index] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 shrink-0 text-red-700 animate-bounce"
                  >
                    <path d="M19.5 22.5a3 3 0 0 0 3-3v-8.174l-6.879 4.022 3.485 1.876a.75.75 0 1 1-.712 1.321l-5.683-3.06a1.5 1.5 0 0 0-1.422 0l-5.683 3.06a.75.75 0 0 1-.712-1.32l3.485-1.877L1.5 11.326V19.5a3 3 0 0 0 3 3h15Z" />
                    <path d="M1.5 9.589v-.745a3 3 0 0 1 1.578-2.642l7.5-4.038a3 3 0 0 1 2.844 0l7.5 4.038A3 3 0 0 1 22.5 8.844v.745l-8.426 4.926-.652-.351a3 3 0 0 0-2.844 0l-.652.351L1.5 9.589Z" />
                  </svg>
                )}

                {sameTasteMessages[index] && (
                  <Music
                    className="size-5 shrink-0 text-yellow-500"
                  />
                )}

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute right-2 top-2 size-6 cursor-pointer rounded-full border-2 border-red-200 bg-red-50 p-0.5 text-red-300 hover:border-red-400 hover:bg-red-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
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
    </div>

      {openChat && (

        
        <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center bg-white/95 p-3 sm:p-6">
          <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-yellow-200 bg-white shadow-xl">
          <div className="flex shrink-0 items-center justify-between border-b border-yellow-200 bg-yellow-50 px-4 py-3 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600">Chat</p>
              <h2 className="text-lg font-bold text-yellow-500">{chatPartner}</h2>
            </div>
            <button
              type="button"
              aria-label="Chat schließen"
              className="rounded-full p-2 text-gray-500 transition hover:bg-yellow-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onClick={() => setopenChat(false)}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div
            id="chatmessagewindow"
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-white px-3 py-4 sm:px-6"
          >
            {chatError && (
              <p className="px-4 text-center text-sm text-red-600">{chatError}</p>
            )}
            
            <div className="space-y-2">
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
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          isCurrentUser
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-gray-200 text-black rounded-bl-none"
                        }`}
                      >
                        <p className="break-words text-sm">{msg.content}</p>
                        <span className="mt-1 block text-[11px] text-gray-400">
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

          <div className="flex shrink-0 items-center gap-2 border-t border-yellow-200 bg-yellow-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:p-4">
            <input
              aria-label="Nachricht schreiben"
              placeholder="Nachricht schreiben ..."
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-w-0 flex-1 rounded-xl border-2 border-yellow-400 bg-white px-3 py-2 text-base outline-none transition placeholder:text-gray-400 focus:border-yellow-600 focus:ring-2 focus:ring-yellow-200 sm:text-lg"
            />

            <button
              type="button"
              aria-label="Nachricht senden"
              disabled={!input.trim()}
              className="rounded-xl bg-yellow-500 p-3 text-white transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={sendMessage}
            >
              <Send className="size-5" aria-hidden="true" />
            </button>
          </div>
          </div>
        </div>
      )}

      {openProfile && (
        <Popup onClose={() => setOpenProfile(false)} bgColor="bg-yellow-50">
          <ProfileSingleView
            selectedProfileIndex={selectedProfileIndex}
            fromWhere="chatter"
          />
        </Popup>
      )}

      {openSuperlikeProfile && selectedSuperlikeUser && (
        <Popup
          onClose={() => setOpenSuperlikeProfile(false)}
          bgColor="bg-yellow-50"
        >
          <ProfileSingleView
            selectedProfileIndex={0}
            fromWhere="chatter"
            directUser={selectedSuperlikeUser}
          />
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
