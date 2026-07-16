"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { UserType } from "../types/User";
import { arraysHaveCommonElement } from "@/lib/arraysHaveCommonElement";
import { Music, User } from "lucide-react";
import Link from "next/link";
import HeartAnimation from "./heartAnimation";
import Score from "./score";
import { useUser } from "@/app/context/UserContext";
import SuperLike_Animation from "./superlike_animation";
import { checkIfLikedInWeek } from "@/lib/checkIfLikedInWeek";
import { useNotification } from "../context/NotificationContext";
import PopUp from "./popup";

export default function Profile() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [Images, setImages] = useState<{
    image_path: string[];
    user_id: string;
  }>();
  const [UserIndex, setUserIndex] = useState(100);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [isSuperlike, setIsSuperlike] = useState(false);
  const [samegenres, setSamegenres] = useState(false);
  const [sameartist, setSameartist] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const controls = useAnimation();
  const { user } = useUser();

  //---- api fetch ----
  async function fetchUsers() {
    const res = await fetch("/api/filterUsers");
    if (!res.ok) return [];
    const data = await res.json();

    const usersArray = data.map((item: { users: any }) => item.users);

    // Setzte Einstellungen für den User

    const res2 = await fetch("/api/settings?id=" + user?.uuid);
    const settings = await res2.json();

    if (res2.status === 404) {
      return 404;
    }

    // Nicht eigener User darstellen und filtere nach Alter
    const filteredUsers = usersArray.filter(
      (user: { uuid: string; alter: number }) => {
        // Alter prüfen
        const [minAlter, maxAlter] = settings[0].alter; // z.B. [20, 50]
        if (user.alter < minAlter || user.alter > maxAlter) return false;

        return true;
      },
    );

    setUsers(filteredUsers);

    return filteredUsers;
  }

  // Hole Bilder für den aktuellen User
  const [imageTs, setImageTs] = useState(() => Date.now());
  useEffect(() => {
    setImageTs(Date.now());
  }, [Images]);

  async function fetchPics() {
    const res = await fetch(
      `/api/getallpicsbyuserid?id=${users[UserIndex].uuid}`,
    );
    if (!res.ok) return;
    const data = await res.json();
    console.log("Fetched images:", data);
    setImages(data);
  }

  async function usersContain() {
    const fetchedUsers = await fetchUsers();
    if (!fetchedUsers || fetchedUsers.length === 0) {
      setIsEmpty(true);
      return;
    }
    const i = 0;
    calculateGenres(i);
    await setUserIndex(i);
  }
  //---- sofort laden ----
  useEffect(() => {
    usersContain();
  }, []);

  //---- Bilder holen wenn user sich ändert ----
  useEffect(() => {
    console.log("Users updated:", users);
    if (!users || users.length === 0) return;
    fetchPics();
  }, [users]);

  //---- bilder durchklicken ----
  function handleClick() {
    if (!users[UserIndex]) return;

    const imageLength = Images?.image_path ? Images.image_path.length : 0;

    if (Images && Images?.image_path && Images?.image_path.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % imageLength);
  }

  //---- deezer zeugs ----

  const { addSameTasteNotification } = useNotification();
  async function calculateGenres(i: number) {
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();

    const filteredUsers = await fetchUsers();

    if (arraysHaveCommonElement(data1.genres, filteredUsers[i].genres)) {
      setSamegenres(true);
      // Anfangsnachricht schicken in chatter, wenn gleiche Genres

      addSameTasteNotification(filteredUsers[i].uuid);
    }

    if (data1.favorite_artist && filteredUsers[i].favorite_artist) {
      if (
        data1.favorite_artist.name === filteredUsers[i].favorite_artist.name
      ) {
        setSameartist(true);
      }
    }
  }

  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  //---- match überprüfen ----
  async function calculateMatch(uuid: string) {
    if (!users.length || UserIndex >= users.length) return false;

    const res = await fetch(`/api/getmatchbyid?id=${uuid}`);
    const data = await res.json();

    const matched = data.some(
      (item: { to: string }) => item.to === users[UserIndex].uuid,
    );

    setIsMatched(matched);

    if (matched) {
      setButtonsDisabled(true);

      await delay(8000);

      setIsMatched(false);
      setButtonsDisabled(false);
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //---- likes logik ----
  const handleLike = async () => {
    if (buttonsDisabled) return;
    if (isMatched) return;

    if (!users.length || !users[UserIndex]) {
      setIsEmpty(true);
      setButtonsDisabled(false);
      return;
    }

    await addlike();

    setSamegenres(false);
    setSameartist(false);

    await controls.start({
      x: 100,
      opacity: 0,
      transition: { duration: 1, ease: "easeOut" },
    });

    setIsMatched(false);
    setButtonsDisabled(false);
    await getNewFilteredUsers();

    await controls.set({ x: 0, opacity: 1 });
  };

  async function addlike() {
    if (buttonsDisabled) return;

    if (!users[UserIndex]) return;

    const randomNumber = Math.random();
    let isUserFake;

    if (users[UserIndex].roles === "fakeUser" && randomNumber > 0.1) {
      isUserFake = true;
    } else {
      isUserFake = false;
    }

    const data = await fetch("/api/getuserdata");
    const user = await data.json();

    const payload = {
      from: user.uuid,
      to: users[UserIndex].uuid,
      isFakeUser: isUserFake,
    };

    await fetch("/api/addlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await calculateMatch(user.uuid);
    console.log("isMatched after calculateMatch:", isMatched);
  }

  //---- dislikes logik -----
  const handleDislike = async () => {
    if (buttonsDisabled) return;
    if (isMatched) return;

    if (!users.length || !users[UserIndex]) {
      setIsEmpty(true);
      setButtonsDisabled(false);
      return;
    }

    setSamegenres(false);
    setSameartist(false);

    await controls.start({
      x: -100,
      opacity: 0,
      transition: { duration: 1, ease: "easeOut" },
    });

    await addDislike();
    await getNewFilteredUsers();

    await controls.set({ x: 0, opacity: 1 });

    setButtonsDisabled(false);
  };

  async function addDislike() {
    if (buttonsDisabled) return;

    if (!users[UserIndex]) return;

    const res = await fetch("/api/getuserdata");
    const user = await res.json();
    const payload = { from: user.uuid, to: users[UserIndex].uuid };

    await fetch("/api/adddislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("disliked", user.name);
  }

  //---- superlike logik -----

  const handlesuperlike = async () => {
    if (buttonsDisabled) return;
    if (isMatched) return;
    if (!user) return;

    //Wenn schon einLike in der Woche geben, dann kein Superlike mehr möglich
    const hasLikedInWeek = await checkIfLikedInWeek(user.uuid);

    if (hasLikedInWeek) {
      setGrayedOut(true);

      return;
    }

    if (!users.length || !users[UserIndex]) {
      setIsEmpty(true);
      setButtonsDisabled(false);
      return;
    }

    await addsuperlike();

    setSamegenres(false);
    setSameartist(false);

    await controls.start({
      x: 100,
      opacity: 0,
      transition: { duration: 1, ease: "easeOut" },
    });

    setIsMatched(false);
    setButtonsDisabled(false);
    await getNewFilteredUsers();

    await controls.set({ x: 0, opacity: 1 });
  };

  const [grayedOut, setGrayedOut] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const hasLikedInWeek = await checkIfLikedInWeek(user.uuid);
      console.log("hasLikedInWeek:", hasLikedInWeek);
      if (hasLikedInWeek === true) {
        setGrayedOut(true);

        return;
      }
    };

    loadData();
  }, [user]);

  async function addsuperlike() {
    if (buttonsDisabled) return;

    if (!users[UserIndex]) return;

    const data = await fetch("/api/getuserdata");
    const user = await data.json();

    const payload = {
      from: user.uuid,
      to: users[UserIndex].uuid,
    };

    await fetch("/api/addsuperlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await calculateMatch(user.uuid);

    setButtonsDisabled(true);
    setIsSuperlike(true);

    await delay(8000);

    setIsSuperlike(false);
    setButtonsDisabled(false);
  }

  // ---- Boost Logik ----

  const [boosttime, setBoosttime] = useState("00:00:00");

  const [boostexpires, setBoostexpires] = useState<Date | null>(null);

  const [showModalBoost, setShowModalBoost] = useState(false);


  function confirmBoost()
  {
    opencheckout();
    setGrayedOut2(true);

  }

  useEffect(() => {
    const loadBoost = async () => {
      const response = await fetch("/api/boost");
      const data = await response.json();

      setBoostexpires(data.expiresAt);
    };

    loadBoost();
  }, []);

  useEffect(() => {
    if (!boostexpires) return;

    const updateCountdown = () => {
      const remaining = new Date(boostexpires).getTime() - Date.now();

      if (remaining <= 0) {
        setBoosttime("00:00:00");
        return;
      }

      const hours = Math.floor(remaining / 3600000);
      const minutes = Math.floor((remaining % 3600000) / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);

      setBoosttime(
        `${hours}:${String(minutes).padStart(2, "0")}:${String(
          seconds,
        ).padStart(2, "0")}`,
      );
    };

    updateCountdown(); // sofort ausführen

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [boostexpires]);


  async function opencheckout() {
    const res = await fetch("/api/checkout/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.uuid
      }),
    });

    const data = await res.json();

    window.location.href = data.url;
    setRocket(true);
  }


  const [grayedOut2, setGrayedOut2] = useState(false);
  const [rocket, setRocket] = useState(false);

  useEffect(() => {
    if (!user) return;

    let ispayed = true;
    if (!ispayed) {
      setGrayedOut2(true);
      return;
    }
  }, [user]);

  // ---- neue users holen nach swipe ----
  async function getNewFilteredUsers() {
    const filteredUsers = await fetchUsers();

    if (!filteredUsers.length || filteredUsers == 404) {
      setIsEmpty(true);
      return;
    }

    const i = 0;
    setUserIndex(i);

    calculateGenres(i);
  }

  // Preview-Player
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 🎧 AUDIO PREVIEW
  function playTrack(previewUrl: string | null | undefined) {
    if (!previewUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(previewUrl);
    audioRef.current.play();
  }

  function pauseTrack(_previewUrl: string | null | undefined) {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }

  // 🎧 FETCH FRESH PREVIEW FROM DEEZER
  async function fetchDeezerPreview(
    trackName: string | null,
    artistName: string | null,
  ): Promise<string | null> {
    if (!trackName || !artistName) return null;

    try {
      // Suchbegriff: "Track Artist" – du kannst das Format anpassen, falls nötig
      const query = encodeURIComponent(`${trackName} ${artistName}`);
      const res = await fetch(`/api/deezer-search?q=${query}`);

      if (!res.ok) throw new Error("Deezer search failed");

      const data = await res.json();
      // Deezer liefert ein Array unter `data.data`; wir nehmen das erste Ergebnis
      const firstTrack = data.data?.[0];
      return firstTrack?.preview ?? null;
    } catch (err) {
      console.error("Fehler beim Abruf der Deezer‑Preview:", err);
      return null;
    }
  }

  return (
    <div className="">
      {isMatched && buttonsDisabled && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <HeartAnimation />
        </div>
      )}

      {isSuperlike && buttonsDisabled && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <SuperLike_Animation />
        </div>
      )}

      {showModalBoost && (
        <PopUp onClose={() => setShowModalBoost(false)}>
          <div className="overflow-y-auto max-h-96">
            <div className="felx flex-wrap">
              <span className="text-gray-500 font-bold">
                Möchten Sie wirklich boosten?
              </span>
              <button
                onClick={() => {
                  setShowModalBoost(false);
                  confirmBoost();

                }}
                className="ml-6 px-4 py-2 bg-yellow-400 text-white font-semibold rounded hover:bg-yellow-300"
              >
                BOOST IT!
              </button>
            </div>
          </div>
        </PopUp>
      )}

      {isEmpty ? (
        <div className="h-full w-full flex justify-center">
          <div className="border-2 rounded-2xl py-4 px-8 border-yellow-300 bg-yellow-50 shadow-lg">
            <p className="text-yellow-500 font-bold">
              Keine übereinstimmende User, ändere oder mache deine
              <Link href="/settings">
                <button className="flex p-2 justify-center items-center text-yellow-500 border-b-2 border-b-amber-200 border-t-2 border-t-white bg-yellow/50 shadow hover:bg-white hover:shadow-md  rounded-2xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Einstellungen
                </button>
              </Link>
              <Image
                src="/images/broom.svg"
                width={40}
                height={40}
                alt="like"
                className="position relative left-90 "
              />
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div>
            {/* button container */}
            <div className="fixed top-1/2 left-0 right-0 z-60 flex justify-between items-center px-2 sm:px-8 pointer-events-auto translate-y-25">
              {/*--dislike burron- */}
              <button
                className="cursor-pointer flex justify-center items-center w-16 h-16 md:w-20 md:h-20 bg-red-200 border-2 rounded-2xl border-yellow-500 shadow-lg hover:rotate-[-20deg] hover:scale-125 transition-transform duration-300"
                onClick={handleDislike}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-red-900"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/*- superlike button*/}
              <button
                className={`flex w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-yellow-400 bg-blue-100 hover:scale-120 transition-transform duration-300 ${grayedOut ? "opacity-50 cursor-not-allowed bg-gray-200" : ""}`}
                onClick={handlesuperlike}
              >
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-15 sm:size-20 justify-center items-center text-blue-200"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {/*- boost button*/}
              <button
                className={`flex w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-yellow-400 bg-gray-100 hover:scale-120 transition-transform duration-300 ${grayedOut2 ? "opacity-50 cursor-not-allowed bg-gray-200" : ""}  `}
                onClick={() => {

                  if(boosttime!=="00:00:00") return;
                  if (buttonsDisabled) return;
                  if (isMatched) return;
                  setShowModalBoost(true);
                }}
              >
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`size-15 md:size-20 justify-center items-center text-gray-300 ${rocket ? "animate-fly" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
                      clipRule="evenodd"
                    />
                    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-700">
                    {boosttime}
                  </span>
                </div>
              </button>

              {/*- like button*/}
              <button
                onClick={handleLike}
                className={`flex justify-center items-center w-16 h-16 md:w-20 md:h-20 bg-green-200 border-2 rounded-2xl border-yellow-500 shadow-lg transition-transform duration-300 ${
                  isMatched && buttonsDisabled
                    ? "animate-pulse opacity-70 rotate-12 scale-125"
                    : "hover:rotate-12 hover:scale-125"
                }`}
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-emerald-900"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <motion.div animate={controls} key={users[UserIndex]?.uuid}>
            <div className="flex flex-col md:flex-row justify-center items-center bg-yellow-50 border-4 border-yellow-200 rounded-2xl shadow-lg p-4 gap-2">
              {/* User Profile */}
              {users[UserIndex]?.roles == "fakeUser" && (
                <div className="absolute  sm:right-5/12 top-80 right-1 bg-green-300 text-white px-2 py-1 rounded-lg z-20 text-xl font-bold ">
                  FAKE USER
                </div>
              )}
              <div
                className="relative w-full max-w-[550px] h-[450px] overflow-hidden md:h-[550px] mx-auto rounded-2xl"
                onClick={handleClick}
              >
                <div className="flex space-x-2 relative top-2 z-10">
                  {users[UserIndex] &&
                    Images?.image_path &&
                    Images.image_path.map((src, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded-md ${
                          index === currentIndex
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    ))}
                </div>

                {users[UserIndex] &&
                  Images?.image_path &&
                  Images.image_path.map((img, index) => (
                    <Image
                      unoptimized
                      key={`${img}-${users[UserIndex]?.uuid}-${index}`}
                      src={`/images/${img}`}
                      alt={`Bild ${img}`}
                      height={650}
                      width={650}
                      className={` z-0 absolute top-0 left-0 rounded-3xl shadow-2xl pb-10 object-cover transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                      } w-[650px] h-[650px] `}
                    />
                  ))}

                <div className="absolute top-[80%]  left-1/2 -translate-x-1/2 text-2xl overflow-visible text-yellow-500 border-2 rounded-2xl px-4 py-1 bg-white">
                  {users[UserIndex]?.name}, {users[UserIndex]?.alter}
                  <span className="text-sm block -mt-1 text-gray-500">
                    {users[UserIndex]?.location}
                  </span>
                </div>
              </div>

              {/* kasten */}
              <div className="text-sm sm:text-base">
                {/* kasten 1 */}
                <div className="px-6 py-4 mt-4 w-full sm:w-sm lg:w-md bg-yellow-200/50 rounded-2xl text-yellow-400 font-semibold shadow-lg ">
                  <User className=" flex w-6 h-6 text-yellow-400" />

                  <div>
                    <div className="grid grid-cols-2 gap-y-4 items-center mx-6 ">
                      <h3>Geschlecht:</h3>
                      <div className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                        {users[UserIndex]?.geschlecht ? (
                          <p>{users[UserIndex]?.geschlecht}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Grösse (cm):</h3>
                      <div className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                        {users[UserIndex]?.groesse ? (
                          <p>{users[UserIndex]?.groesse}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Ausbildung:</h3>
                      <div className="border-3 rounded-3xl py-1 px-4  text-center break-normal">
                        {users[UserIndex]?.ausbildung ? (
                          <p>{users[UserIndex]?.ausbildung}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Interessen:</h3>

                      <div className="flex flex-col space-y-0.5">
                        {users[UserIndex]?.intressen?.length ? (
                          users[UserIndex].intressen.map((intresse, index) => (
                            <div key={`${intresse} ${index}`}>
                              <p className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                                {intresse}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                            Keine Daten
                          </div>
                        )}
                      </div>

                      <h3>Ich suche:</h3>
                      <div className="flex flex-col space-y-0.5">
                        {users[UserIndex]?.ichsuche?.map((ichsuche, index) => (
                          <div key={`${ichsuche} ${index}`}>
                            <p className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                              {ichsuche}
                            </p>
                          </div>
                        )) || (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center break-normal">
                            Keine Daten
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* kasten 2 */}
                <div
                  className={`px-6 py-4 mt-5 rounded-2xl font-semibold shadow-lg   ${
                    samegenres
                      ? "genre-animate animate-pulse text-yellow-400"
                      : "bg-yellow-200/50 text-yellow-400 "
                  }`}
                >
                  <Music
                    className={`flex w-6 h-6 text-yellow-400 ${
                      samegenres ? "animate-spin" : ""
                    }`}
                  />

                  <div>
                    <div
                      className={`grid grid-cols-2 gap-y-2 items-center mx-6 break-normal`}
                    >
                      <h3>Fragen:</h3>
                      <div className="grid grid-cols gap-y-1 shrink">
                        <Score uuid={users[UserIndex]?.uuid}></Score>
                      </div>

                      <h3>Genres:</h3>
                      <div className="grid grid-cols gap-y-1">
                        {Array.isArray(users[UserIndex]?.genres) &&
                        users[UserIndex].genres.length > 0 ? (
                          users[UserIndex].genres.map((genre, index) => (
                            <div key={`${genre} ${index}`}>
                              <p className="border-3 rounded-3xl py-1 px-4 text-center  break-normal">
                                {genre}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center  break-normal">
                            Keine Daten
                          </div>
                        )}
                      </div>

                      <h3>Lieblingslied:</h3>

                      <div className="border-3 rounded-3xl py-1 px-3 text-center  break-normal">
                        {users[UserIndex]?.favorite_track ? (
                          <div className="flex items-center gap-1 min-w-0">
                            <Image
                              src={
                                users[UserIndex]?.favorite_track?.image ||
                                "/images/Home.png"
                              }
                              alt="Album Cover"
                              height={30}
                              width={30}
                              style={{ objectFit: "cover" }} // schneidet es sauber zu
                              quality={100}
                            />

                            <div className="md:w-full max-w-[80px] min-w-0">
                              <p className="font-semibold ">
                                {users[UserIndex]?.favorite_track?.name}
                              </p>
                              <p className="text-sm text-yellow-400">
                                {users[UserIndex]?.favorite_track?.artist}
                              </p>
                            </div>

                            <button
                              onClick={async () => {
                                const track = users[UserIndex]?.favorite_track;
                                if (!track) return;

                                // Optional: Lade‑Indikator zeigen (z. B. Button kurz deaktivieren)
                                const freshPreview = await fetchDeezerPreview(
                                  track.name,
                                  track.artist,
                                );
                                if (freshPreview) {
                                  playTrack(freshPreview); // nutzt deine bestehende Audio‑Logik
                                } else {
                                  alert(
                                    "Konnte keinen aktuellen Preview‑Link von Deezer abrufen.",
                                  );
                                }
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 hover:text-green-500 hover:scale-150 transition-colors duration-300"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button onClick={() => pauseTrack(null)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="size-6 hover:text-red-500 hover:scale-150 transition-colors duration-300"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <div>
                        <h3 className="">Lieblings-</h3>
                        <h3 className="">interpret:</h3>
                      </div>
                      <div
                        className={`flex flex-col space-y-0.5 border-3 rounded-3xl py-1 px-3 text-center break-normal`}
                      >
                        {users[UserIndex]?.favorite_artist ? (
                          <>
                            <div className="flex items-center gap-1 py-1 px-3 mb-2">
                              <Image
                                src={
                                  users[UserIndex]?.favorite_artist
                                    ?.favorite_artist1?.image || "/music2.svg"
                                }
                                alt="Album Cover"
                                height={30}
                                width={30}
                                style={{ objectFit: "cover" }} // schneidet es sauber zu
                                quality={100}
                              />
                              <div>
                                <p className="font-semibold">
                                  {
                                    users[UserIndex]?.favorite_artist
                                      ?.favorite_artist1?.name
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1  py-1 px-3">
                              <Image
                                src={
                                  users[UserIndex]?.favorite_artist
                                    ?.favorite_artist2?.image || "/music2.svg"
                                }
                                alt="Album Cover"
                                height={30}
                                width={30}
                                style={{ objectFit: "cover" }} // schneidet es sauber zu
                                quality={100}
                              />
                              <div>
                                <p className="font-semibold">
                                  {
                                    users[UserIndex]?.favorite_artist
                                      ?.favorite_artist2?.name
                                  }
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
