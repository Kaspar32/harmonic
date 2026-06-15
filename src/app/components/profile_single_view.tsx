import Image from "next/image";
import { useState, useEffect } from "react";
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

    if(directUser)
    {
        setUser(directUser);
    }

    const userIdtoFetch= directUser ? directUser.uuid : userData[0].uuid;

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

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-2xl font-bold mb-4 text-yellow-600">
        <p className="text-yellow-500">{User?.name}</p>
      </h2>

      <Image
        onClick={handleClick}
        src={`/images/${Images?.image_path?.[imageIndex] ?? "defaultProfile.png"}${Images?.image_path?.[imageIndex] ? `?targetuuid=${user?.uuid}` : ""}`}
        width={1000}
        height={1000}
        alt=""
        className="border-2 border-yellow-500 rounded-2xl p-1"
      />

      <div className="flex gap-4 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6 text-yellow-600"
        >
          <path d="M12 1.5a.75.75 0 0 1 .75.75V4.5a.75.75 0 0 1-1.5 0V2.25A.75.75 0 0 1 12 1.5ZM5.636 4.136a.75.75 0 0 1 1.06 0l1.592 1.591a.75.75 0 0 1-1.061 1.06l-1.591-1.59a.75.75 0 0 1 0-1.061Zm12.728 0a.75.75 0 0 1 0 1.06l-1.591 1.592a.75.75 0 0 1-1.06-1.061l1.59-1.591a.75.75 0 0 1 1.061 0Zm-6.816 4.496a.75.75 0 0 1 .82.311l5.228 7.917a.75.75 0 0 1-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 0 1-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 0 1-1.247-.606l.569-9.47a.75.75 0 0 1 .554-.68ZM3 10.5a.75.75 0 0 1 .75-.75H6a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10.5Zm14.25 0a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75Zm-8.962 3.712a.75.75 0 0 1 0 1.061l-1.591 1.591a.75.75 0 1 1-1.061-1.06l1.591-1.592a.75.75 0 0 1 1.06 0Z" />
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
