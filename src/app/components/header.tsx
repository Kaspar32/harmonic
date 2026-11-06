"use client";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";

export default function Header() {
  const { user } = useUser();

  return (
    <div className="neu-surface flex items-center justify-between rounded-none border-b-0 p-3">
      <div className="flex items-center gap-4">
        <Link href="/">
            <div className="cursor-pointer font-bold font-sans text-3xl text-slate-600 md:text-5xl">
            harmonic
          </div>
        </Link>

        <label className="hidden text-sm text-slate-500 sm:block md:text-base">
          {user && <p>Willkommen {user.name}</p>}
        </label>
      </div>

      <div className="flex items-center gap-3 md:gap-5 md:mr-4">
       

        <Link href="/User_register">
          <button aria-label="Profil öffnen" className="group cursor-pointer rounded-full p-1 focus:ring-3 ring-blue-500">
            <div className="relative md:h-12 md:w-12 h-8 w-8  overflow-hidden rounded-full focus:ring-2 focus:ring-blue-400">
              <Image
                unoptimized
                src={
                  user?.profile_pics?.[0]
                    ? `/images/${user?.profile_pics?.[0]}`
                    : "/images/149071.png"
                }
                alt="Profilbild"
                fill
                className="object-cover"
              />
            </div>
          </button>
        </Link>

        <Link href={user ? "/settings" : "/User_register"}>
          <button aria-label="Einstellungen öffnen" className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl p-0 focus:ring-3 ring-blue-500 md:h-14 md:w-14">
            <div className="relative flex h-full w-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-7 text-slate-500 active:text-blue-600 md:size-9"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
                />
              </svg>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
}
