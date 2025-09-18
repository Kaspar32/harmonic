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
        <Link href="/home">
          <label className=" font-bold font-sans text-3xl md:text-7xl text-blue-500 text-shadow-sm">
            harmonic
          </label>
        </Link>

        <label className="text-md md:text-3xl md:pt-4 text-blue-400 text-shadow-sm">
          {user && <p>Willkommen, {user.name}</p>}
        </label>
      </div>

      <div className="flex gap-4 w-20 md:gap-20 md:w-50 items-center">
        <Link href="/User_register">
          <button className="cursor-pointer">
            <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-blue-400 ring-offset-2">
              <Image
                src={image[0]?.imageBase64 || "/images/149071.png"}
                alt="Profilbild"
                fill
                className="object-cover"
              />
            </div>
          </button>
        </Link>

        <Link href="/settings">
          <button className="group cursor-pointer ring-2 ring-blue-500 ring-offset-2  rounded-4xl">
            <Image
              src="/images/settings.png"
              height={50}
              width={50}
              className=" z-0 rounded-4xl  transition duration-200 group-focus:invert group-focus:brightness-0 group-focus:contrast-200 "
              alt="Profilbild"
            />
          </button>
        </Link>
      </div>
    </div>
  );
}
