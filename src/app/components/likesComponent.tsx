"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { UserType } from "../types/User";
import { Loader2, Heart, Lock, UserRound } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import Popup from "./popup";
import ProfileSingleView from "./profile_single_view";

export default function LikesTest() {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  //Fetche Likes und die Daten dazu und speichere das Bild von jenem die du geliket hast

  async function fetchlikes() {
    const res = await fetch(`/api/getlikesfull?id=${user?.uuid}`);
    if (!res.ok) return;
    const data = await res.json();
    setUsers_Likes(data);
  }

  async function fetchLikesyou() {
    const res = await fetch(`/api/getlikesyoufull?id=${user?.uuid}`);
    if (!res.ok) return;
    const data = await res.json();
    setUsers_youLikes(data);

  }

  useEffect(() => {

    if (!user) return;
    
    setLoading(true);
    Promise.all([fetchlikes(), fetchLikesyou()]).finally(() => setLoading(false));
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

        setHasAbo(data || false);

      } catch (err) {
        console.error("Fehler beim Laden des Abo-Status:", err);
      }
    }

    fetchAboStatus();
  }, []);

  async function opencheckout() {
    const res = await fetch("/api/checkout/abo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.uuid, 
      }),
    });

    const data = await res.json();

    window.location.href = data.url;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-yellow-600">Verbindungen</p>
        <h1 className="text-3xl font-bold text-yellow-500">Deine Likes</h1>
        <p className="mt-1 text-sm text-gray-500">Entdecke, wer dich mag und wen du bereits ausgewählt hast.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-yellow-300 bg-yellow-50 shadow-xl">
      {/* Button: Likes You */}
      <button
        onClick={() => {
          settoggleLikesYou(true);
          settoggleYouLike(false);
        }}
        aria-selected={toggleLikesYou}
        className={`px-4 py-3 text-center transition sm:px-6 ${toggleLikesYou ? "bg-yellow-100" : "bg-yellow-50 hover:bg-yellow-100"}`}
      >
        <label className="text-yellow-400 md:text-3xl text-sm font-extrabold cursor-pointer">
          Mögen dich
        </label>
      </button>

      {/* Panel: Likes You */}
      <div className={`${toggleLikesYou ? "block" : "hidden"} min-h-[420px] overflow-y-auto bg-yellow-100 p-4 sm:p-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <Loader2 className="animate-spin text-yellow-400" />}

          {!loading && (
            <>
              {users_youlikes.length > 0 ? (
                users_youlikes.map((user, index) =>
                  user?.profile_pics ? (
                    <button
                      type="button"
                      key={index}
                      className="group flex items-center gap-3 rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onClick={() => hasAbo ? handleblurrredPPClick(index) : setOpenDialog(true)}
                    >
                      <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-yellow-300">
                        <Image
                          unoptimized
                          src={ `/images/${user.profile_pics[0]}`}
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-yellow-500">{users_youlikes[index].name}</p>
                        <p className="text-sm text-gray-500">{users_youlikes[index].alter} Jahre</p>
                        {!hasAbo && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-500"><Lock className="size-3" /> Premium ansehen</p>}
                      </div>
                    </button>
                  ) : null,
                )
              ) : (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center text-gray-500">
                  <Heart className="mx-auto mb-2 size-8 text-yellow-400" />
                  Noch niemand hat dich geliked.
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
                    <li>Mehr Boosts</li>
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
        aria-selected={toggleYouLike}
        className={`px-4 py-3 text-center transition sm:px-6 ${toggleYouLike ? "bg-yellow-200" : "bg-yellow-50 hover:bg-yellow-100"}`}
      >
        <label className="text-yellow-400 mt-5 md:text-3xl text-sm font-extrabold cursor-pointer">
          Deine Likes
        </label>
      </button>

      {/* Panel: You Like */}
      <div className={`${toggleYouLike ? "block" : "hidden"} min-h-[420px] overflow-y-auto bg-yellow-200 p-4 sm:p-6`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <Loader2 className="animate-spin text-yellow-400" />}

          {!loading && (
            <>
              {users_likes.length > 0 ? (
                users_likes.map((users, index) =>
                  users?.profile_pics? (
                    <button
                      type="button"
                      key={index}
                      className="group flex items-center gap-3 rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      onClick={() => handlePPClick(index)}
                    >
                      <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-yellow-300">
                        <Image
                          unoptimized
                          src={`/images/${users.profile_pics[0]}`}
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-bold text-yellow-500">{users_likes[index].name}</p>
                        <p className="text-sm text-gray-500">{users_likes[index].alter} Jahre</p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-gray-500"><UserRound className="size-3" /> Profil öffnen</p>
                      </div>
                    </button>
                  ) : null,
                )
              ) : (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 p-8 text-center text-gray-500">
                  <Heart className="mx-auto mb-2 size-8 text-yellow-400" />
                  Du hast noch niemanden geliked.
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
    </div>
  );
}
