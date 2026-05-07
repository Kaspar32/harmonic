"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { UserType } from "../types/User";
import { Loader2 } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import Popup from "./popup";
import ProfileSingleView from "./profile_single_view";
import { likesCache } from "@/lib/likesCache";

export default function LikesTest() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  //Fetche Likes und die Daten dazu und speichere das Bild von jenem die du geliket hast

  async function fetchlikes()
  {
    const res = await fetch(`/api/getlikesfull?id=${user?.uuid}`);
    const data = await res.json();

    setUsers_Likes(data);

    console.log("Neue daten:",data);

  }

  async function fetchLikesyou() {
    const res = await fetch(`/api/getlikesyoufull?id=${user?.uuid}`);
    const data = await res.json();
    setUsers_youLikes(data);

  }

  useEffect(() => {
    fetchlikes();
    fetchLikesyou();
  }, [user]);

  const [users_likes, setUsers_Likes] = useState<UserType[]>([]);
  const [users_youlikes, setUsers_youLikes] = useState<UserType[]>([]);

  const [toggleLikesYou, settoggleLikesYou] = useState(true);
  const [toggleYouLike, settoggleYouLike] = useState(false);

  function blurred(str: string) {
    const blurred = str.replace(/\.png$/, "_blurred.png");
    return `${blurred}?blur=1`;
  }

  const [openProfile, setOpenProfile] = useState(false);
  const [openblurredProfile, setOpenblurredProfile] = useState(false);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(-1);

  function handlePPClick(index: number): void {
    setSelectedProfileIndex(index);
    setOpenProfile(true);
  }

  function handleblurrredPPClick(index: number): void {
    setSelectedProfileIndex(index);
    setOpenblurredProfile(true);
  }

  const [openDialog, setOpenDialog] = useState(false);
  const [hasAbo, setHasAbo] = useState(false);

  useEffect(() => {
    
    // Get hasAbo from DB

    async function fetchAboStatus() {
      try {
        const res = await fetch(`/api/getAboStatus`);
        const data = await res.json();

        setHasAbo(data || null);
      } catch (err) {
        console.error("Fehler beim Laden des Abo-Status:", err);
      }
    }

    fetchAboStatus();
  }, []);

  async function opencheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.uuid, // wichtig!
      }),
    });

    const data = await res.json();

    window.location.href = data.url;
  }

  return (
    <div className="relative">
      {/* Button: Likes You */}
      <button
        onClick={() => {
          settoggleLikesYou(true);
          settoggleYouLike(false);
        }}
        className="text-center bg-yellow-100 h-full px-4 py-1 rounded-tl-2xl"
      >
        <label className="text-yellow-400 md:text-3xl text-sm font-extrabold cursor-pointer">
          Mögen Sie
        </label>
      </button>

      {/* Panel: Likes You */}
      <div
        className={`absolute md:h-[500px] w-full overflow-y-auto h-[450px] bg-yellow-100 rounded-2xl rounded-tl-none shadow-xl ${
          toggleLikesYou ? "opacity-100 block" : "opacity-0 hidden"
        }`}
      >
        <div className="flex flex-wrap gap-4 m-4 md:m-20  justify-center">
          {loading && <Loader2 className="animate-spin text-yellow-400" />}

          {!loading && (
            <>
              {users_youlikes.length > 0 ? (
                users_youlikes.map((user, index) =>
                  user?.profile_pics ? (
                    <div
                      key={index}
                      className="border-2 rounded-2xl p-2 border-yellow-400 bg-yellow-100 flex flex-col items-center"
                    >
                      <div className="w-24 h-24 overflow-hidden rounded-2xl">
                        <Image
                          src={
                            hasAbo
                              ? `/images/${user.profile_pics[0]}`
                              : blurred(`/images/${user.profile_pics[0]}`)
                          }
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            hasAbo
                              ? handleblurrredPPClick(index)
                              : setOpenDialog(true)
                          }
                        />
                      </div>

                      <div className="text-yellow-400 mt-2 text-center">
                        {users_youlikes[index].name},{" "}
                        {users_youlikes[index].alter}
                      </div>
                    </div>
                  ) : null,
                )
              ) : (
                <div className="border-4 rounded-2xl p-4 border-gray-300 bg-gray-100 text-gray-500">
                  Keine Daten vorhanden
                </div>
              )}
            </>
          )}

          {openDialog && (
            <div>
              <Popup onClose={() => setOpenDialog(false)}>
                <div className="text-gray-700">
                  Schliessen Sie ein Abo ab:
                  <ul className="list-disc list-inside mt-2">
                    <li>Mehr Superlikes</li>
                    <li>Schaue wer dich magt</li>
                  </ul>
                </div>
                <button
                  onClick={opencheckout}
                  className="bg-yellow-400 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 flex items-center gap-2 mt-4"
                >
                  Jetzt kaufen!
                </button>
              </Popup>
            </div>
          )}
        </div>
      </div>

      {/* Button: You Like */}
      <button
        onClick={() => {
          settoggleYouLike(true);
          settoggleLikesYou(false);
        }}
        className="h-full w-max bg-yellow-200 px-4 py-1 rounded-tr-2xl"
      >
        <label className="text-yellow-400 mt-5 md:text-3xl text-sm font-extrabold cursor-pointer">
          Sie mögen
        </label>
      </button>

      {/* Panel: You Like */}
      <div
        className={`absolute md:h-[500px] w-full overflow-y-auto h-[450px] bg-yellow-200 rounded-2xl rounded-tl-none shadow-xl ${
          toggleYouLike ? "opacity-100 block" : "opacity-0 hidden"
        }`}
      >
        <div className="flex flex-wrap gap-4 m-4 md:m-20 justify-center">
          {loading && <Loader2 className="animate-spin text-yellow-400" />}

          {!loading && (
            <>
              {users_likes.length > 0 ? (
                users_likes.map((users, index) =>
                  users?.profile_pics? (
                    <div
                      key={index}
                      className="border-2 rounded-2xl p-2 border-yellow-400 bg-yellow-100 flex flex-col items-center"
                    >
                      <div className="w-24 h-24 overflow-hidden rounded-2xl">
                        <Image
                          src={`/images/${users.profile_pics[0]}`}
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handlePPClick(index)}
                        />
                      </div>

                      <div className="text-yellow-400 mt-2 text-center">
                        {users_likes[index].name}, {users_likes[index].alter}
                      </div>
                    </div>
                  ) : null,
                )
              ) : (
                <div className="border-4 rounded-2xl p-4 border-gray-300 bg-gray-100 text-gray-500">
                  Keine Daten vorhanden
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {openProfile && (
        <Popup onClose={() => setOpenProfile(false)} bgColor="bg-yellow-50">
          <ProfileSingleView
            selectedProfileIndex={selectedProfileIndex}
            fromWhere={"likesComponent"}
          />
        </Popup>
      )}

      {openblurredProfile && (
        <Popup
          onClose={() => setOpenblurredProfile(false)}
          bgColor="bg-yellow-50"
        >
          <ProfileSingleView
            selectedProfileIndex={selectedProfileIndex}
            fromWhere={"likesComponentblurred"}
          />
        </Popup>
      )}
    </div>
  );
}
