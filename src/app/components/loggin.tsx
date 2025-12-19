"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Loggin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<{ name: string } | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Nicht eingeloggt oder Fehler");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const router = useRouter();

  async function login() {
    const res = await fetch("/api/loggin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      setError(errorText);
    } else {
      router.push("/");

      window.location.reload();
    }
  }

  async function loggout() {
    const res = await fetch("/api/loggout", {
      method: "POST",
      credentials: "include",
    });
    console.log(res);
    window.location.reload();
  }

  return (
    <div>
      {!user ? (
        <div className="space-y-4 text-gray-500">
          <div className="flex flex-col gap-4 border-4 border-yellow-300 bg-yellow-50 rounded-2xl p-4 w-80 shadow-2xl">
            <input
              id="name"
              name="name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-amber-300 focus:outline-none px-2 py-1 rounded"
              type="text"
              placeholder="Benutzername"
            />

            <input
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-amber-300 focus:outline-none px-2 py-1 rounded"
              type="password"
              placeholder="Passwort"
            />

            <button
              onClick={login}
              className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold"
            >
              Loggin
            </button>
            <div className="mt-4 text-rose-500 font-bold">
              {error && <p>{error}</p>}
            </div>

            <div>
              <p className="text-gray-400">Noch kein Account?</p>
              <Link href="/User_register">
                <div className="flex gap-2 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold w-full content-center justify-center">
                  <button>
                    Registrieren
                  </button>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-4 border-yellow-300 bg-yellow-50 rounded-2xl p-6 w-80 shadow-2xl text-gray-700">
          <p className="text-gray-500">
            <b className="text-yellow-400">Angemeldet als:</b> {user?.name}
          </p>
          <button
            onClick={loggout}
            className="bg-yellow-400 hover:bg-yellow-500 text-white w-max px-4 py-2 rounded font-bold flex justify-center"
          >
            Ausloggen
          </button>
        </div>
      )}
    </div>
  );
}
