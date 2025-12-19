"use client";
import { useEffect, useState } from "react";


export default function Test() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Nicht eingeloggt oder Fehler");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="m-10">
      {!user ? (
        <div className="flex flex-col items-center justify-center gap-10">
          <p className="flex justify-center font-extrabold text-3xl md:text-4xl text-yellow-500 text-shadow-2xs ">
            Bitte loggen Sie sich ein!
            
          </p>

          <a
              href="/loggin"
              className="flex justify-center items-center w-full md:w-100  font-extrabold text-2xl md:text-4xl mt-10 text-yellow-400 bg-yellow-100 hover:bg-white border-4 rounded-2xl shadow-2xl "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-10"
              >
                <path
                  fillRule="evenodd"
                  d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
              Zur Anmeldung
            </a>

            <a
              href="/User_register"
              className="flex justify-center items-center w-full md:w-100 font-extrabold  text-2xl md:text-4xl mt-10 text-yellow-400 bg-yellow-100 hover:bg-white border-4 rounded-2xl shadow-2xl "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-10"
              >
                <path
                  fillRule="evenodd"
                  d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
              Zur Registration
            </a>
        </div>

        
      ) : (
        <p className="flex justify-center font-extrabold text-lg sm:text-xl md:text-4xl text-gray-300 border-2 rounded-2xl ">
          Willkommen {user?.name}!
        </p>
      )}

    </div>
  );
}
