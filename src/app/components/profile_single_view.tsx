import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UserType } from "../types/User";
import { useUser } from "@/app/context/UserContext";

type Props = {
  selectedProfileIndex: number;
  fromWhere: string;
  directUser?: UserType;
};

export default function ProfileSingleView({
  selectedProfileIndex,
  fromWhere,
  directUser,
}: Props) {
  const [User, setUser] = useState<UserType>();
  const [Images, setImages] = useState<{
    image_path: string[];
    user_id: string;
  }>();

  const { user } = useUser();

  async function fetchusers() {
    // Handhabung wenn die Anfrage vom chatter kommt
    let res1 = await fetch(`/api/getmatchbyid?id=${user?.uuid}`);

    // Handhabung wenn die Anfrage von der likesComponent kommt
    if (fromWhere == "likesComponent") {
      res1 = await fetch(`/api/getlikesbyid?id=${user?.uuid}`);
    }

    // Handhabung wenn die Anfrage von der likesComponent kommt und die Bilder freigegeben wurden, also im sonst blurred Bereich geklickt wurde
    if (fromWhere == "likesComponentblurred") {
      res1 = await fetch(`/api/getlikesyoubyid?id=${user?.uuid}`);
    }

    const data1 = await res1.json();

    const targetLike = data1[selectedProfileIndex];
    const userIdToFetch =
      fromWhere === "likesComponentblurred" ? targetLike.from : targetLike.to;
    const userData = await fetch(`/api/getuserbyid?id=${userIdToFetch}`).then(
      (res) => res.json(),
    );

    setUser(userData[0]);

    if (directUser) {
      setUser(directUser);
    }

    const userIdtoFetch = directUser ? directUser.uuid : userData[0].uuid;

    const res2 = await fetch(`/api/getallpicsbyuserid?id=${userIdtoFetch}`);
    if (!res2.ok) return;
    const data2 = await res2.json();
    setImages(data2);
  }

  useEffect(() => {
    fetchusers();
  }, [user, directUser]);

  const [imageIndex, setImageIndex] = useState(0);

  function handleClick() {
    if (!User) return;

    const imageLength = Images?.image_path ? Images.image_path.length : 0;

    if (Images && Images?.image_path && Images?.image_path.length === 0) return;
    setImageIndex((prev) => (prev + 1) % imageLength);
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

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-2xl font-bold mb-4 text-yellow-600">
        <p className="text-yellow-500">{User?.name}</p>
      </h2>

      <Image
        unoptimized
        onClick={handleClick}
        key={`${Images?.image_path?.[imageIndex]}-${User?.uuid}`}
        src={`/images/${Images?.image_path?.[imageIndex] ?? "defaultProfile.png"}?t=${Date.now()}`}
        width={1000}
        height={1000}
        alt=""
        className="border-2 border-yellow-500 rounded-2xl p-1"
      />

      <div onClick={handleClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-8 text-yellow-700 cursor-pointer border-2 rounded"
        >
          <path
            fillRule="evenodd"
            d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Geschlecht:</span>{" "}
        {User?.geschlecht}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Alter:</span>{" "}
        {User?.alter}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Standort:</span>{" "}
        {User?.location}
      </p>

      <p className="text-lg mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Grösse (cm):</span>{" "}
        {User?.groesse}
      </p>

      <p className="text-sm mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">Musikgeneres:</span>{" "}
        {User?.genres?.join(", ")}
      </p>

      <div className="text-sm mb-2 border-2 border-yellow-500 rounded-2xl p-2">
        <span className="font-semibold text-gray-400">Lieblingslied:</span>
        <div className=" py-1 px-3 text-center  break-normal">
          {User?.favorite_track ? (
            <div className="flex items-center gap-1">
              <Image
                src={User?.favorite_track?.image || "/images/Home.png"}
                alt="Album Cover"
                height={30}
                width={30}
                style={{ objectFit: "cover" }} // schneidet es sauber zu
                quality={100}
              />
              <div className="md:w-full max-w-[120px]">
                <div className="font-semibold text-yellow-500">
                  {User?.favorite_track?.name}
                </div>
                <div className="text-sm text-yellow-500">
                  {User?.favorite_track?.artist}
                </div>
              </div>

              <button
                onClick={async () => {
                  const track = User?.favorite_track;
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
      </div>

      <div className="text-sm mb-2 border-2 border-yellow-500 rounded-2xl  p-2">
        <span className="font-semibold text-gray-400">
          Lieblingsinterpreten:
        </span>{" "}
        <div className=" py-1 px-3 text-center  break-normal">
          {User?.favorite_artist ? (
            <div className="flex flex-wrap items-center gap-2 ">
              {User?.favorite_artist?.favorite_artist1 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist1?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist1?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist2 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist2?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist2?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist3 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist3?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist3?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist4 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist4?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist4?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist5 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist5?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist5?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist6 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist6?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist6?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist7 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist7?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist7?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist8 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist8?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist8?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist9 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist9?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist9?.name}
                    </div>
                  </div>
                </div>
              )}
              {User?.favorite_artist?.favorite_artist10 && (
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      User?.favorite_artist?.favorite_artist10?.image ||
                      "/images/Home.png"
                    }
                    alt="Lieblingsinterpret Bild"
                    height={30}
                    width={30}
                    style={{ objectFit: "cover" }}
                    quality={100}
                  />
                  <div className="md:w-full max-w-[120px]">
                    <div className="font-semibold text-yellow-500">
                      {User?.favorite_artist?.favorite_artist10?.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Keine Daten</p>
          )}
        </div>
      </div>
    </div>
  );
}
