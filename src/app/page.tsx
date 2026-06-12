"use client";
import { useUser } from "@/app/context/UserContext";

export default function SalesPage() {
  const { user } = useUser();

  return (
    <div className="m-10">
      {!user ? (
        <div className="border-1 p-20 border-yellow-500 rounded-2xl shadow-2xl bg-yellow-100">
          <div className="flex flex-wrap justify-center gap-5">
            <div className="p-4 border-yellow-200 border-2 w-250 bg-yellow-50 rounded-xl text-4xl font-extrabold text-yellow-300 shadow-lg">
              <p>
                Finde Menschen, die deinen{" "}
                <a className="text-yellow-500">Sound</a> fühlen.
              </p>
              <p className="text-sm text-gray-500">
                Harmonic verbindet euch über Genres, Lieblingssongs und gemeinsame
                Vibes — wie ein Festival-Abend, der nie endet.
              </p>
            </div>

            <div className="transition-all duration-300 border-1 rounded-2xl p-4 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
              <p className="text-2xl font-bold text-yellow-500 mb-2">Features</p>
              <ul className="text-sm font-bold text-gray-500 space-y-1">
                <li>• Dating das nach Musik klingt</li>
                <li>• Weniger Formular. Mehr Gefühl.</li>
                <li>• Vibe-basierte Matches</li>
                <li>• Song-Previews im Profil</li>
              </ul>
            </div>

            <div className="transition-all duration-300 border-1 rounded-2xl p-4 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
              <p className="text-2xl font-bold text-yellow-500 mb-2">Preise</p>
              <div className="space-y-2">
                <div>
                  <p className="text-lg font-bold text-gray-500">Basic</p>
                  <p className="text-sm text-gray-400">Kostenlos</p>
                  <ul className="text-xs text-gray-500">
                    <li>• Unbegrenzte Swipes</li>
                    <li>• 1 Super Like pro Monat</li>
                    <li>• 1 Boost pro Monat</li>
                  </ul>
                </div>
                <div>
                  <p className="text-lg font-bold text-yellow-500">Premium</p>
                  <p className="text-sm text-gray-400">9.99 CHF/Monat</p>
                  <ul className="text-xs text-gray-500">
                    <li>• Sehen wer dich geliked hat</li>
                    <li>• 10 Super Likes</li>
                    <li>• 5 Boosts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="transition-all duration-300 border-1 rounded-2xl p-4 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
              <p className="text-2xl font-bold text-yellow-500 mb-2">Warum Harmonic?</p>
              <ul className="text-sm font-bold text-gray-500 space-y-1">
                <li>• 78% mehr tiefe Gespräche nach dem ersten Match</li>
                <li>• Emotionale Profile mit Album Artwork</li>
                <li>• Cinematisch inszenierte Musik-Signaturen</li>
              </ul>
            </div>

            <div className="transition-all duration-300 border-1 rounded-2xl p-4 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
              <p className="text-2xl font-bold text-yellow-500 mb-2">So einfach geht's</p>
              <ol className="text-sm font-bold text-gray-500 space-y-1">
                <li>1. Kostenlos registrieren</li>
                <li>2. Lieblingssongs auswählen</li>
                <li>3. Matches entdecken</li>
              </ol>
            </div>

            <div className="transition-all duration-300 border-1 rounded-2xl p-4 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
              <p className="text-2xl font-bold text-yellow-500 mb-2">FAQ</p>
              <details className="text-sm">
                <summary className="font-bold text-gray-500 cursor-pointer">Wie funktioniert das Matching?</summary>
                <p className="text-gray-400 mt-1">Wir vergleichen eure Musikgeschmäcker und finden ähnliche Vibes.</p>
              </details>
              <details className="text-sm mt-1">
                <summary className="font-bold text-gray-500 cursor-pointer">Welche Musikgenres sind dabei?</summary>
                <p className="text-gray-400 mt-1">Alle! Von Pop über Rock bis EDM.</p>
              </details>
            </div>

            <a
              href="/loggin"
              className="flex justify-center items-center w-full md:w-100 font-extrabold text-2xl md:text-4xl p-4 text-yellow-500 bg-white shadow border-b-amber-100 border-t-2 border-t-white border-b-2 hover:bg-yellow-50 hover:shadow-md rounded-2xl"
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
              Jetzt anmelden
            </a>

            <a
              href="/User_register"
              className="flex justify-center items-center w-full md:w-100 font-extrabold text-2xl md:text-4xl p-4 text-yellow-500 bg-white shadow border-b-amber-100 border-t-2 border-t-white border-b-2 hover:bg-yellow-50 hover:shadow-md rounded-2xl"
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
              Kostenlos registrieren
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center gap-4 border-2 bg-yellow-100 border-yellow-300 rounded-2xl p-6 shadow-2xl text-gray-500">
            <p className="p-4 bg-yellow-50 flex-col-reverse justify-center font-extrabold text-lg sm:text-xl md:text-4xl text-yellow-300 border-1 rounded-2xl shadow-lg">
              Willkommen <a className="text-yellow-500">{user?.name}</a>!
            </p>

            <a className="items-center justify-center text-sm md:text-xl mt-10 ml-10 text-gray-500 text-shadow-2xs">
              Deine nächsten Musik-Matches warten. Swipe durch Vibes, nicht
              durch Formulare.
            </a>

            <button
              className="active:inset-shadow-amber-100 bg-yellow-50 border-b-2 border-b-amber-100 border-t-2 border-t-white mt-10 font-extrabold text-lg md:text-3x p-2 text-yellow-500 shadow hover:bg-yellow-50 hover:shadow-md rounded-2xl"
              onClick={() => {
                window.location.href = "/home";
              }}
            >
              Zum Discover-Flow
            </button>
          </div>
        </>
      )}
    </div>
  );
}