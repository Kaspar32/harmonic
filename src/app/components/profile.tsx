"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { UserType } from "../types/User";
import { fetchUsers } from "@/lib/fetchUsers";
import { arraysHaveCommonElement } from "@/lib/arraysHaveCommonElement";
import { Music, User } from "lucide-react";

export default function Profile() {
  const [Images, setImages] = useState<
    { id: string; imageBase64: string; position: number; userUuid: string }[]
  >([]);

  // Handle Bildereihenfolge onClick
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    if (!users[UserIndex]) return;

    const userImages = Images.filter(
      (img) => img.userUuid === users[UserIndex].uuid
    );
    if (userImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % userImages.length);
  };

  //Effekt beim Match
  const [isMatched, setIsMatched] = useState(false);

  //Effekt bei überinstimmender Geschmäcker

  const [samegenres, setSamegenres] = useState(false);
  const [sameartist, setSameartist] = useState(false);
  //Dieser User wird angezeigt
  const [UserIndex, setUserIndex] = useState(0);

  //Funktionen zur Swipebewegung

  const controls = useAnimation();

  //Anzeigekonstante wenn keine User ausgefiltered werden

  const [isEmpty, setIsEmpty] = useState(false);

  // Handle Like und Dislike

  const getRandomUserIndex = () => {
    if (users.length <= 1) return 0; // falls nur 1 User, nichts wechseln

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * users.length);
    } while (newIndex === UserIndex); // solange wiederholen bis er anders ist

    return newIndex;
  };

  const handledislike = () => {
    setSamegenres(false);
    setSameartist(false);
    controls.start({
      x: -50,
      opacity: 0,
      transition: { duration: 0.5 },
    });

    setTimeout(() => {
      controls.set({ x: 0, opacity: 1 });
      if (users.length === 0) return;
      const i = getRandomUserIndex();
      setUserIndex(i);

      calculateGenres(i);
    }, 500);
  };

  const handlelike = async () => {
    addlike(); // Sofort aufrufen
    setSamegenres(false);
    setSameartist(false);
    controls.start({
      x: 50,
      opacity: 0,
      transition: { duration: 0.5 },
    });

    setTimeout(() => {
      controls.set({ x: 0, opacity: 1 });
      if (users.length === 0) return;
      const i = getRandomUserIndex();
      setUserIndex(i);
      calculateGenres(i);
    }, 500);
  };

  async function calculateMatch(uuid: any) {
    if (!users.length || UserIndex >= users.length) return;

    const res1 = await fetch(`/api/getmatchbyid?id=${uuid}`);
    const data = await res1.json();

    data.forEach((item: { to: string }) => {
      if (item.to === users[UserIndex].uuid) {
        setIsMatched(true);
        setTimeout(() => {
          setIsMatched(false);
        }, 800);
      }
    });
  }

  async function addlike() {
    const res1 = await fetch("/api/getuserdata");
    const data = await res1.json();

    const payload = { from: data.uuid, to: users[UserIndex].uuid };

    const res = await fetch("/api/addlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log(result);

    //Kalkuliere obs ein Match ist
    calculateMatch(data.uuid);
  }

  //Uservariable
  const [users, setUsers] = useState<UserType[]>([]);

  //Vergeliche die Musikgeschmäcker

  async function calculateGenres(i: number) {
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();

    const filteredUsers = await fetchUsers();

    if (arraysHaveCommonElement(data1.genres, filteredUsers[i].genres)) {
      //alert("teeets");
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

  //Haben zwei Arrays ein gemeinsames Element

  async function fetchPics() {
    const res = await fetch("/api/addprofilepics");

    if (res.ok) {
      const data = await res.json();

      console.log();

      setImages(data);
    }
  }

  //Immer beim Rendern wird useEffect ausgeführt
  useEffect(() => {
    async function init() {
      try {
        const benutzer = await fetchUsers();
        //alert(benutzer);
        if (benutzer) {
          setUsers(benutzer);
        }

        if (benutzer.length === 0) {
          setIsEmpty(true);
        }

        await fetchPics();
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    }

    init();
  }, []);

  return (
    <div>
      {isEmpty ? (
        <div className="h-full w-full flex justify-center">
          <div className="border-4 rounded-2xl py-4 px-8 border-gray-300 bg-gray-100">
            <p className="text-yellow-500 font-bold">
              Leider keine übereinstimmende User
              <Image
                src="/images/brush-cleaning.svg"
                width={20}
                height={20}
                alt="like"
                className="position relative left-30"
              />
            </p>
          </div>{" "}
        </div>
      ) : (
        <div>
          <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-full max-w-[640px] px-4 md:top-[50%] md:left-[17%] md:translate-x-0">
            <button onClick={handledislike} className="cursor-pointer">
              <div className="flex justify-center items-center w-16 h-16 md:w-20 md:h-20 bg-red-200 border-2 rounded-2xl border-yellow-500 shadow-lg hover:rotate-[-20deg] hover:scale-150 transition-transform duration-300">
                <Image
                  src="/images/x.svg"
                  width={20}
                  height={20}
                  alt="dislike"
                />
              </div>
            </button>

            <button
              onClick={handlelike}
              className={`transition-all duration-2000 ease-in-out
            ${
              isMatched
                ? "scale-550 -translate-x-50 opacity-0"
                : "scale-100 opacity-100"
            }`}
            >
              <div className="flex justify-center items-center w-16 h-16 md:w-20 md:h-20 bg-green-200 border-2 rounded-2xl border-yellow-500 shadow-lg hover:rotate-20 hover:scale-150 transition-transform duration-300">
                <Image
                  src="/images/heart.svg"
                  width={20}
                  height={20}
                  alt="like"
                  className={`
            ${isMatched ? "animate-fly" : ""}`}
                />
                {isMatched && (
                  <>
                    <p className="text-2xl font-extrabold text-yellow-500">
                      MATCH
                    </p>
                    <Image
                      src="/images/Heart.png"
                      width={20}
                      height={20}
                      alt="like"
                      className="animate-fly"
                    />
                  </>
                )}
              </div>
            </button>
          </div>

          {/* User Profile */}
          <motion.div animate={controls} key={users[UserIndex]?.uuid}>
            <div className="flex flex-col md:flex-row justify-center items-center bg-yellow-50 border-4 border-yellow-200 rounded-2xl shadow-lg p-4">
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
                      key={img.id}
                      src={`${img.imageBase64}`}
                      alt={`Bild ${img.id}`}
                      height={650}
                      width={650}
                      className={` z-0 absolute top-0 left-0 rounded-3xl shadow-2xl pb-10 object-cover transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                      } w-[650px] h-[650px] `}
                    />
                  ))}

                <div className="absolute top-[60%] md:top-[90%] left-1/2 -translate-x-1/2 text-2xl text-yellow-500 border-2 rounded-2xl px-4 py-1 bg-white">
                  {users[UserIndex]?.name}, {users[UserIndex]?.alter}
                </div>
              </div>

              <div>
                <div className="px-6 py-4 mt-4  bg-yellow-200/50 rounded-2xl text-yellow-400 font-semibold shadow-lg ">
                  <User className=" flex w-6 h-6 text-yellow-400" />

                  <div>
                    <div className="grid grid-cols-2 gap-y-4 items-center mx-6">
                      <h3>Geschlecht:</h3>
                      <div className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                        {users[UserIndex]?.geschlecht ? (
                          <p>{users[UserIndex]?.geschlecht}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Grösse (cm):</h3>
                      <div className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                        {users[UserIndex]?.grösse ? (
                          <p>{users[UserIndex]?.grösse}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Ausbildung:</h3>
                      <div className="border-3 rounded-3xl py-1 px-4  text-center w-max">
                        {users[UserIndex]?.ausbildung ? (
                          <p>{users[UserIndex]?.ausbildung}</p>
                        ) : (
                          <p>Keine Daten</p>
                        )}
                      </div>

                      <h3>Interessen:</h3>

                      <div className="flex flex-col space-y-0.5">
                        {users[UserIndex]?.intressen?.length ? (
                          users[UserIndex].intressen.map((intresse) => (
                            <div key={intresse}>
                              <p className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                                {intresse}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                            Keine Daten
                          </div>
                        )}
                      </div>

                      <h3>Ich suche:</h3>
                      <div className="flex flex-col space-y-0.5">
                        {users[UserIndex]?.ichsuche?.map((ichsuche) => (
                          <div key={ichsuche}>
                            <p className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                              {ichsuche}
                            </p>
                          </div>
                        )) || (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                            Keine Daten
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

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
                    <div className="grid grid-cols-2 gap-y-2 items-center mx-6">
                      <h3>Genres:</h3>

                      <div className="grid grid-cols gap-y-1">
                        {Array.isArray(users[UserIndex]?.genres) &&
                        users[UserIndex].genres.length > 0 ? (
                          users[UserIndex].genres.map((genre) => (
                            <div key={genre}>
                              <p className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                                {genre}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="border-3 rounded-3xl py-1 px-4 text-center w-max">
                            Keine daten
                          </div>
                        )}
                      </div>

                      <h3>Lieblingslied:</h3>

                      <div className="border-3 rounded-3xl  px-3 text-center w-max">
                        {users[UserIndex]?.favorite_track ? (
                          <div className="flex items-center gap-1">
                            <Image
                              src={
                                users[UserIndex]?.favorite_track.image ||
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
                                {users[UserIndex]?.favorite_track.name}
                              </p>
                              <p className="text-sm text-yellow-400">
                                {users[UserIndex]?.favorite_track.artist}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p>Keine daten</p>
                        )}
                      </div>

                      <h3 className="">Lieblingsinterpret:</h3>

                      <div
                        className={`border-3 rounded-3xl py-1 px-3 text-center w-max ${
                          sameartist ? "animate-pulse text-green-600" : ""
                        }`}
                      >
                        {users[UserIndex]?.favorite_artist ? (
                          <div className="flex items-center gap-1">
                            <Image
                              src={
                                users[UserIndex]?.favorite_artist.image ||
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
                                {users[UserIndex]?.favorite_artist.name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p>Keine daten</p>
                        )}
                      </div>
                    </div>

                    {/* */}
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
