"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { UserType } from "../types/User";

type Props = {
  onImageClick?: (user: UserType) => void;
};

export default function Superlike({ onImageClick }: Props) {
  const [opensuperlike, setOpensuperlike] = useState(false);

  const [superlikes, setSuperlikes] = useState<
    {
      user_id: string;
      image_path: string;
    }[]
  >([]);

  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    showSuperlikes();
  }, []);

  async function showSuperlikes() {
    const res = await fetch("/api/getuserdata");
    const data = await res.json();

    const res1 = await fetch(`/api/getsuperlikebyid?id=${data.uuid}`);
    const data1 = await res1.json();

    if (data1.length != 0) setOpensuperlike(true);

    const allFirstImages = await Promise.all(
      data1.map(async (superlike: { from: string }) => {
        try {
          const res2 = await fetch(
            `/api/getfirstpicbyuserid?id=${superlike.from}`,
          );
          const pics = await res2.json();
          return pics;
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${superlike.from}:`,
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

    setSuperlikes(validImages);

    const allUsers = await Promise.all(
      data1.map(async (superlike: { from: string }) => {
        try {
          const res3 = await fetch(`/api/getuserbyid?id=${superlike.from}`);
          const users = await res3.json();
          return users[0]; // nur das erste Bild zurückgeben
        } catch (err) {
          console.error(
            `Fehler beim Laden von Bildern für ID ${superlike.from}:`,
            err,
          );
          return null;
        }
      }),
    );

    const validUsers = allUsers.map((user) => (Boolean(user) ? user : null));

    // alert(validUsers[0].name);

    setUsers(validUsers);
  }

  async function liked(index:number) {

    const res = await fetch("/api/getuserdata");
    const user = await res.json();
    const payload = { from: user.uuid, to: users[index].uuid };

     await fetch("/api/addlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const payload2 = { from: users[index].uuid, to: user.uuid };

    //alert(payload2);

    await fetch("/api/deletesuperlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
    });

    showSuperlikes();





  }

  async function unliked(index: number) {

    const res = await fetch("/api/getuserdata");
    const user = await res.json();
    const payload = { from: user.uuid, to: users[index].uuid };

    await fetch("/api/adddislike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const payload2 = { from: users[index].uuid, to: user.uuid };

    //alert(payload2);

    await fetch("/api/deletesuperlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
    });

    showSuperlikes();
  }

  return (
    <div className="flex flex-col gap-4">
      {opensuperlike &&
        superlikes.map((superlike, index) => (
          <div
            key={index}
            className="lg:w-90 h-30 border-2 border-blue-300 rounded-xl shadow-2xl bg-[url(/images/hearts.jpg)] animate-pulse"
          >
            <div className="flex">
              <Image
                src={
                  superlike?.image_path
                    ? `/images/${superlike.image_path}`
                    : "/images/defaultProfile.png"
                }
                height={100}
                width={100}
                className="ml-2 mt-2 rounded-4xl border-3 border-blue-300 justify-center cursor-pointer"
                alt="Profilbild"
                onClick={() => {
                  if (onImageClick && users[index]) {
                    onImageClick(users[index]);
                  }
                }}
              />

              <p className="text-yellow-500 font-bold text-xl ml-10 mt-10">
                SUPERLIKE von {users?.[index]?.name}
              </p>
            </div>

            <div className="flex justify-between position relative bottom-7 m-2">
              <button
                className="rounded-xl bg-red-200 hover:bg-red-950"
                onClick={() => unliked(index)}
              >
                <svg
                  fill=""
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-red-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button className="border-2 border-green-400 rounded-xl bg-green-200 hover:bg-green-950"
              onClick={()=> liked(index)}>
                <svg
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-green-400 fill-current "
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
        ))}
    </div>
  );
}
