"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { UserType } from "../types/User";
import { Loader2 } from "lucide-react";
import { getImageSrc } from "@/lib/getImageSrc";

export default function LikesTest() {
  const [loading, setLoading] = useState(false);

  //Fetche Likes und die Daten dazu und speichere das Bild von jenem die du geliket hast
  async function fetchlikes() {
    setLoading(true);
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();
    const res = await fetch(`/api/getlikesbyid?id=${data1.uuid}`);
    const data = await res.json();

    const allFirstImages = await Promise.all(
      data.map(async (like: { to: string }) => {
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

    const allUsers = await Promise.all(
      data.map(async (like: { to: string }) => {
        try {
          const res3 = await fetch(`/api/getuserbyid?id=${like.to}`);
          const users = await res3.json();
          return users[0];
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.to}:`,
            err
          );
          return null;
        }
      })
    );

    //Behalte den Index auch wenn es kein Bild gibt

    const validImages = allFirstImages.map((img) =>
      Boolean(img) ? img : null
    );
    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));

    // Setze den State mit nur den ersten Bildern
    setImages_likes(validImages);
    setUsers_Likes(validUsers);
  }

  async function fetchLikesyou() {
    //Fetch uuid
    const res1 = await fetch("/api/getuserdata");
    const data1 = await res1.json();

    //getLikes by uuid
    const res = await fetch(`/api/getlikesyoubyid?id=${data1.uuid}`);
    const data = await res.json();

    const allFirstImages = await Promise.all(
      data.map(async (like: { from: string }) => {
        try {
          const res2 = await fetch(`/api/getpicsbyid?id=${like.from}`);
          const pics = await res2.json();
          return pics[0]; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.from}:`,
            err
          );
          return null;
        }
      })
    );

    const allUsers = await Promise.all(
      data.map(async (like: { from: string }) => {
        try {
          const res3 = await fetch(`/api/getuserbyid?id=${like.from}`);
          const users = await res3.json();
          return users[0]; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${like.from}:`,
            err
          );
          return null;
        }
      })
    );

    const validImages = allFirstImages.map((img) =>
      Boolean(img) ? img : null
    );
    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));

    setImages_youlikes(validImages);
    setUsers_youLikes(validUsers);

    setLoading(false);
  }

  useEffect(() => {
    fetchlikes();
    fetchLikesyou();
  }, []);

  const [images_youlikes, setImages_youlikes] = useState<
    {
      id: string;
      imageBase64_blurred?: string;
      user_id?: string;
      position?: number;
    }[]
  >([]);

  const [images_likes, setImages_likes] = useState<
    {
      id: string;
      imageBase64?: string;
      user_id?: string;
      position?: number;
    }[]
  >([]);

  const [users_likes, setUsers_Likes] = useState<UserType[]>([]);
  const [users_youlikes, setUsers_youLikes] = useState<UserType[]>([]);

  const [toggleLikesYou, settoggleLikesYou] = useState(true);
  const [toggleYouLike, settoggleYouLike] = useState(false);

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
          Mögen Dich
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
              {images_youlikes.length > 0 ? (
                images_youlikes.map((img, index) =>
                  img?.imageBase64_blurred ? (
                    <div
                      key={index}
                      className="border-2 rounded-2xl p-2 border-yellow-400 bg-yellow-100 flex flex-col items-center"
                    >
                      <div className="w-24 h-24 overflow-hidden rounded-2xl">
                        <Image
                          src={getImageSrc(img.imageBase64_blurred)}
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full blur-md object-cover"
                        />
                      </div>

                      <div className="text-yellow-400 mt-2 text-center">
                        {users_youlikes[index].name}, {users_youlikes[index].alter}
                      </div>
                    </div>
                  ) : null
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

      {/* Button: You Like */}
      <button
        onClick={() => {
          settoggleYouLike(true);
          settoggleLikesYou(false);
        }}
        className="h-full w-max bg-yellow-200 px-4 py-1 rounded-tr-2xl"
      >
        <label className="text-yellow-400 mt-5 md:text-3xl text-sm font-extrabold cursor-pointer">
          Magst Du
        </label>
      </button>

      {/* Panel: You Like */}
      <div
        className={`absolute md:h-[500px] w-full overflow-y-auto h-[570px] bg-yellow-200 rounded-2xl rounded-tl-none shadow-xl ${
          toggleYouLike ? "opacity-100 block" : "opacity-0 hidden"
        }`}
      >
        <div className="flex flex-wrap gap-4 m-4 md:m-20 justify-center">
          {loading && <Loader2 className="animate-spin text-yellow-400" />}

          {!loading && (
            <>
              {images_likes.length > 0 ? (
                images_likes.map((img, index) =>
                  img?.imageBase64 ? (
                    <div
                      key={index}
                      className="border-2 rounded-2xl p-2 border-yellow-400 bg-yellow-100 flex flex-col items-center"
                    >
                      <div className="w-24 h-24 overflow-hidden rounded-2xl">
                        <Image
                          src={getImageSrc(img.imageBase64)}
                          alt={`Bild ${index + 1}`}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="text-yellow-400 mt-2 text-center">
                        {users_likes[index].name}, {users_likes[index].alter}
                      </div>
                    </div>
                  ) : null
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
    </div>
  );
}
