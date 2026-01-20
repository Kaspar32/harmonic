"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { UserType } from "../types/User";
import { arraysHaveCommonElement } from "@/lib/arraysHaveCommonElement";
import { Music, User } from "lucide-react";
import Link from "next/link";
import { getImageSrc } from "@/lib/getImageSrc";
import HeartAnimation from "./heartAnimation";

export default function Profile() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [Images, setImages] = useState<
    { id: string; imageBase64: string; position: number; userUuid: string }[]
  >([]);
  const [UserIndex, setUserIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMatched, setIsMatched] = useState(false);
  const [samegenres, setSamegenres] = useState(false);
  const [sameartist, setSameartist] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const controls = useAnimation();

  //---- api fetch ----
  async function fetchUsers() {
    const res = await fetch("/api/filterUsers");
    if (!res.ok) return [];
    const data = await res.json();
    const usersArray = data.map((item: { users: any }) => item.users);

    // Setzte Einstellungen für den User
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();

    const res2 = await fetch("/api/settings?id=" + data1.uuid);
    const settings = await res2.json();

    if (res2.status === 404) {
      return 404;
    }

    // Nicht eigener User darstellen und filtere nach Geschlecht
    const filteredUsers = usersArray.filter(
      (user: { uuid: string; alter: number }) => {
        // Alter prüfen
        const [minAlter, maxAlter] = settings[0].alter; // z.B. [20, 50]
        if (user.alter < minAlter || user.alter > maxAlter) return false;

        return true;
      }
    );

    //console.log("data",filteredUsers[0]);

    setUsers(filteredUsers);
    return filteredUsers;
  }

  async function fetchPics() {
    const res = await fetch("/api/addprofilepics");
    if (!res.ok) return;
    const data = await res.json();
    setImages(data);
  }

  async function usersContain() {
    const fetchedUsers = await fetchUsers();
    if (!fetchedUsers.length) {
      setIsEmpty(true);
    }
  }

  //---- sofort laden ----
  useEffect(() => {
    usersContain();
    fetchPics();
  }, []);

  //---- randomizer ----
  const getRandomUserIndex = (length: number) => {
    if (length <= 1) return 0;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * length);
    } while (newIndex === UserIndex);
    return newIndex;
  };

  function handleClick() {
    if (!users[UserIndex]) return;
    const userImages = Images.filter(
      (img) => img.userUuid === users[UserIndex].uuid
    );
    if (userImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % userImages.length);
  }

  //---- spotify zeugs ----
  async function calculateGenres(i: number) {
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();

    const filteredUsers = await fetchUsers();

    if (arraysHaveCommonElement(data1.genres, filteredUsers[i].genres)) {
      setSamegenres(true);
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
      (item: { to: string }) => item.to === users[UserIndex].uuid
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

  // ---- neue users holen nach swipe ----
  async function getNewFilteredUsers() {
    const filteredUsers = await fetchUsers();

    if (!filteredUsers.length || filteredUsers == 404) {
      setIsEmpty(true);
      return;
    }

    const i = getRandomUserIndex(filteredUsers.length);
    setUserIndex(i);
    calculateGenres(i);
  }

  return (
    <div className="">
      {isMatched && buttonsDisabled && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <HeartAnimation />
        </div>
      )}

      {isEmpty ? (
        <div className="h-full w-full flex justify-center">
          <div className="border-4 rounded-2xl py-4 px-8 border-yellow-300 bg-yellow-100 shadow-lg">
            <p className="text-yellow-500 font-bold">
              Keine übereinstimmende User, ändere oder mache deine
              <Link href="/settings">
                <button className="flex items-center p-2 text-yellow-500 border-2 border-yellow-400 hover:bg-white rounded-2xl">
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
                className="position relative left-60 animate-bounce"
              />
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div>
            {/* button container */}
            <div className="fixed top-1/2 left-0 right-0 z-60 flex justify-between items-center px-2 sm:px-8 pointer-events-auto -translate-y-1/2">
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
              {users[UserIndex]?.roles=="fakeUser" && (

                  <div className="absolute sm:top-72 sm:right-5/12 top-32 right-1 bg-green-300 text-white px-2 py-1 rounded-lg z-20 text-xl font-bold rotate-35">
                    FAKE USER
                  </div>

                )}
              <div
                className="relative w-full max-w-[550px] h-[450px] overflow-hidden md:h-[550px] mx-auto rounded-2xl"
                onClick={handleClick}
              >
                <div className="flex space-x-2 relative top-2 z-10">
                  {users[UserIndex] &&
                    Images.length > 0 &&
                    Images.filter(
                      (img) => img.userUuid === users[UserIndex].uuid
                    ).map((src, index) => (
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
                  Images.length > 0 &&
                  Images.filter(
                    (img) => img.userUuid === users[UserIndex].uuid
                  ).map((img, index) => (
                    <Image
                      key={`${img.id} ${index}`}
                      src={getImageSrc(img.imageBase64)}
                      alt={`Bild ${img.id}`}
                      height={650}
                      width={650}
                      className={` z-0 absolute top-0 left-0 rounded-3xl shadow-2xl pb-10 object-cover transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                      } w-[650px] h-[650px] `}
                    />
                  ))}

                <div className="absolute top-[83%]  left-1/2 -translate-x-1/2 text-2xl overflow-visible text-yellow-500 border-2 rounded-2xl px-4 py-1 bg-white">
                  {users[UserIndex]?.name}, {users[UserIndex]?.alter}
                </div>
              </div>

              {/* kastne */}
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
                      samegenres ? "animate-bounce" : ""
                    }`}
                  />

                  <div>
                    <div className="grid grid-cols-2 gap-y-2 items-center mx-6 break-normal">
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
                            Keine daten
                          </div>
                        )}
                      </div>

                      <h3>Lieblingslied:</h3>

                      <div className="border-3 rounded-3xl py-1 px-3 text-center  break-normal">
                        {users[UserIndex]?.favorite_track ? (
                          <div className="flex items-center gap-1">
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
                            <div className="md:w-full max-w-[120px]">
                              <p className="font-semibold">
                                {users[UserIndex]?.favorite_track?.name}
                              </p>
                              <p className="text-sm text-yellow-400">
                                {users[UserIndex]?.favorite_track?.artist}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p>Keine daten</p>
                        )}
                      </div>

                      <div>
                        <h3 className="">Lieblings-</h3>
                        <h3 className="">interpret:</h3>
                      </div>
                      <div
                        className={`border-3 rounded-3xl py-1 px-3 text-center break-normal ${
                          sameartist ? "animate-pulse text-green-600" : ""
                        }`}
                      >
                        {users[UserIndex]?.favorite_artist ? (
                          <div className="flex items-center gap-1">
                            <Image
                              src={
                                users[UserIndex]?.favorite_artist?.image ||
                                "/images/Home.png"
                              }
                              alt="Album Cover"
                              height={30}
                              width={30}
                              style={{ objectFit: "cover" }} // schneidet es sauber zu
                              quality={100}
                            />
                            <div>
                              <p className="font-semibold">
                                {users[UserIndex]?.favorite_artist?.name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p>Keine daten</p>
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
