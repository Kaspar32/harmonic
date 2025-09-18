"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [newMatch, setNewMatch] = useState(false);

  function changechat() {
    setNewMatch(false);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function checkNewMatch() {
      const res1 = await fetch("/api/auth");
      const data1 = await res1.json();

      const res2 = await fetch(`/api/getmatchbyid?id=${data1.uuid}`);
      const data = await res2.json();

      const storageKey = `lastMatchId_${data1.uuid}`;

      const lastId = Number(localStorage.getItem(storageKey) || 0);

          console.log("Last ID:", lastId);

          if (data.length > 0 && data[data.length - 1]?.id > lastId) {
            //alert("test");
            setNewMatch(true);
            localStorage.setItem(storageKey, String(data[data.length - 1].id));
          }

    }

    checkNewMatch();
    const interval = setInterval(checkNewMatch, 10000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex justify-between bg-blue-200 p-10  h-6  border-t-2 border-blue-400">
      <div className=" relative w-[60%] top-[-40px] left-[-30px] text-xs md:text-sm md:w-[600px]">
        <label className=" font-bold font-sans  text-blue-500 text-shadow-sm">
          harmonic Datingapp 2025, Alle Rechte vorbehalten.
        </label>
      </div>

      <div className="flex md:gap-20 md:w-[550px] w-52 gap-4 items-center">
        <Link href="/home">
          <button className="group cursor-pointer hover:bg-blue-400  rounded-2xl focus:ring-3 ring-blue-500">
            <Image
              src="/images/Home.png"
              height={55}
              width={55}
              className="rounded-4xl  z-0 transition duration-200 group-focus:invert group-focus:brightness-0 group-focus:contrast-200"
              alt="Profilbild"
            />
          </button>
        </Link>
        <Link href="/likes">
          <button className="group cursor-pointer hover:bg-blue-400 rounded-2xl focus:ring-3 ring-blue-500">
            <Image
              src="/images/Likes.png"
              height={50}
              width={50}
              className=" rounded-4xl p-1 transition duration-200 group-focus:invert group-focus:brightness-0 group-focus:contrast-200"
              alt="Profilbild"
            />
          </button>
        </Link>

        <Link href="/chat">
          <button
            onClick={changechat}
            className="group cursor-pointer hover:bg-blue-400 rounded-2xl focus:ring-3 ring-blue-500"
          >
            {newMatch && (
              <Image
                src="/images/new.svg"
                height={15}
                width={15}
                className="rounded-4xl relative left-8 top-3 z-10"
                alt="Notification"
              />
            )}

            <Image
              src="/images/Chat.png"
              height={50}
              width={50}
              className="rounded-4xl z-0 transition duration-200 group-focus:invert group-focus:brightness-0 group-focus:contrast-200"
              alt="Chat"
            />
          </button>
        </Link>

        <Link href="/profile_edit">
          <button className="group cursor-pointer hover:bg-blue-400 rounded-2xl focus:ring-3 ring-blue-500">
            <Image
              src="/images/Profil.svg"
              height={50}
              width={50}
              className="  rounded-4xl p-2 z-0 transition duration-200 group-focus:invert group-focus:brightness-0 group-focus:contrast-200"
              alt="ProfileEdit"
            />
          </button>
        </Link>
      </div>
    </div>
  );
}
