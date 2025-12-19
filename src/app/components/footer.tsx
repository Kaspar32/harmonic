"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [newMatch, setNewMatch] = useState(false);
  const [useruuid, setUseruuid] = useState();

  function changechat() {
    setNewMatch(false);
  }
 
  useEffect(() => {
    const controller = new AbortController();

    async function checkNewMatch() {
      const res1 = await fetch("/api/auth");
      const data1 = await res1.json();

      setUseruuid(data1.uuid);

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
        <Link href={useruuid ? "/home" : "/User_register"}>
          <button className="group cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-2xl focus:ring-3 ring-blue-500 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:size-8 size-6 m-2 text-white active:text-blue-200"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </button>
        </Link>
        <Link href={useruuid ? "/likes" : "/User_register"}>
          <button className="group cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-2xl focus:ring-3 ring-blue-500 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:size-8 size-6 m-2 text-white active:text-blue-200"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </button>
        </Link>

        <Link href={useruuid ? "/chat" : "/User_register"}>
          <button  onClick={changechat} className="group relative cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-2xl focus:ring-3 ring-blue-500 ">
            {newMatch && (
              <Image
                src="/images/new.svg"
                height={15}
                width={15}
                className="rounded-4xl absolute w-3 h-3 left-6 top-2 md:left-10 md:top-2 z-10"
                alt="Notification"
              />
            )}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:size-8 size-6 m-2 text-white active:text-blue-200"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
            </svg>
          </button>
        </Link>

        <Link href={useruuid ? "/profile_edit" : "/User_register"}>
          <button className="group cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-2xl focus:ring-3 ring-blue-500 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="md:size-8 size-6 m-2 text-white active:text-blue-200"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
