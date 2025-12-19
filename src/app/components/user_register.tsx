"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function UserRegister() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((res) => {
        if (!res.ok) throw new Error("Nicht eingeloggt oder Fehler");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  async function loggout() {
    await fetch("/api/loggout", {
      method: "POST",
      credentials: "include",
    });
    window.location.reload();
  }

  async function register() {
    setError("");
    setSuccess("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, confirmPassword }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      setError(errorText);
    } else {
      const successText = await res.text();
      setSuccess(successText);
    }
  }

  return (
    <div>
      {user ? (
        <div className="flex flex-col gap-4 border-4 border-yellow-300 bg-yellow-50 rounded-2xl p-6 w-80 shadow-2xl text-gray-700">
          <p className="text-gray-400">
            <b className="text-yellow-400">Angemeldet als:</b> {user?.name}
          </p>
          <button
            onClick={loggout}
            className="bg-yellow-400 hover:bg-yellow-500 text-white w-max px-4 py-2 rounded font-bold flex justify-center"
          >
            Ausloggen
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-4 border-yellow-300 bg-yellow-50 rounded-2xl p-6 w-80 shadow-2xl text-gray-500">
          <input
            id="name"
            name="name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-amber-300 focus:outline-none px-2 py-1 rounded "
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
          <input
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border border-amber-300 focus:outline-none px-2 py-1 rounded"
            type="password"
            placeholder="Passwort bestätigen"
          />
          <button
            onClick={register}
            className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold"
          >
            Registrieren
          </button>

          {error && <div className="mt-2 text-rose-500 font-bold">{error}</div>}
          {success && (
            <div className="mt-2 text-emerald-500 font-bold">{success}</div>
          )}
          <div>
            <p className="text-gray-400 mt-4">Haben Sie bereits einen Account?</p>
            <Link
              href="/loggin"
              className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold text-center flex gap-2 justify-center"
            >
              <p>Zum loggin</p>
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
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
