"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pics } from "../types/Pics";

export default function Header() {
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [image, setImage] = useState<Pics[]>([]);

  useEffect(() => {
    async function loadUserAndImages() {
      const res = await fetch("/api/auth", { credentials: "include" });
      if (!res.ok) {
        setUser(null);
        return;
      }

      const userData = await res.json();
      setUser(userData);

      const res2 = await fetch(`/api/getpicsbyid?id=${userData.uuid}`);
      if (!res2.ok) return;

      const imagesData = await res2.json();
      setImage(imagesData);
    }
    loadUserAndImages();
  }, []);


  return (
    <div className="flex justify-between bg-blue-200 p-3  border-b-2 border-blue-400">
      <div className="flex items-center gap-4">
        <Link href="/">
          <div className="font-bold font-sans text-3xl md:text-7xl text-blue-500 text-shadow-sm cursor-pointer">
            harmonic
          </div>
        </Link>

        <label className="text-md md:text-3xl md:pt-4 text-blue-400 text-shadow-sm">
          {user && <p>Willkommen {user.name}</p>}
        </label>
      </div>

      <div className="flex gap-4 items-center md:gap-20 md:mr-20">
        <Link href="/User_register">
          <button className="group cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-full focus:ring-3 ring-blue-500 ">
            <div className="relative md:h-12 md:w-12 h-8 w-8  overflow-hidden rounded-full focus:ring-2 focus:ring-blue-400">
              <Image
                src={image[0]?.imageBase64 || "/images/149071.png"}
                alt="Profilbild"
                fill
                className="object-cover"
              />
            </div>
          </button>
        </Link> 

        <Link href={ user ? "/settings" : "/User_register"}>
          <button className="group cursor-pointer shadow-lg shadow-blue-900/30 active:inset-shadow-sm active:inset-shadow-blue-400 border-t border-t-blue-100 border-b border-b-blue-500/30 rounded-2xl focus:ring-3 ring-blue-500 ">
            <div className="relative md:h-12 md:w-12 h-8 w-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="md:size-12 text-white active:text-blue-200"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
              </svg>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
