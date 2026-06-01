"use client";
import { useUser } from "@/app/context/UserContext";
import { useNotification } from "./context/NotificationContext";

export default function Test() {
  const { user } = useUser();

  return (
    <div className="m-10">
      {!user ? (

        <div className="border-1 p-20 border-yellow-500 rounded-2xl shadow-2xl bg-yellow-100">
        <div className="flex flex-wrap justify-center gap-5">
          <div className= "p-4 border-yellow-200 border-2 w-250 bg-yellow-50  rounded-xl text-4xl font-extrabold  text-yellow-300 shadow-lg">
            <p className="">
              Finde Menschen, die deinen{" "}
              <a className="text-yellow-500">Sound</a> fühlen.
            </p>
            <p className=" text-sm text-gray-500">
              Harmonic verbindet euch über Genres, Lieblingssongs und gemeinsame
              Vibes — wie ein Festival-Abend, der nie endet.
            </p>
          </div>

          <div className=" transition-all duration-300 border-1 rounded-2xl p-2 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
            <p className=" text-xl font-bold text-gray-500">
              Dating das nach <a className="text-yellow-500">Musik</a> klingt
            </p>

            <p className=" text-sm font-bold text-gray-500">
              Weniger Formular. Mehr Gefühl.
            </p>
          </div>

          <div className="border-1 transition-all duration-300 rounded-2xl p-2 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
            <p className=" text-xl font-bold text-gray-500">
              Vibe-basierte <a className="text-yellow-500"> Matches</a>
            </p>
            <p className=" text-sm font-bold text-gray-500">
              Entdecke Menschen mit gleichen Genres, Artists und Songs. Dein
              Profil erzählt eine Geschichte — kein Lebenslauf..
            </p>
          </div>

          <div className="border-1  transition-all duration-300 rounded-2xl p-2 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
            <p className=" text-xl font-bold text-gray-500">
              Song-<a className="text-yellow-500">Previews</a>
            </p>

            <p className=" text-sm font-bold text-gray-500">
              Höre Lieblingstracks direkt im Profil — emotional, nicht
              technisch.
            </p>
          </div>

          <div className="border-1 transition-all duration-300 rounded-2xl p-2 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
            <p className=" text-2xl font-bold text-yellow-500">78%</p>
            <p className=" text-sm font-bold text-gray-500">
              mehr tiefe Gespräche nach dem ersten Match
            </p>
          </div>

          <div className=" transition-all duration-300  border-1 rounded-2xl p-2 w-80 md:w-150 bg-yellow-50 shadow-lg border-yellow-400">
            <p className=" text-2xl font-bold text-yellow-500">
              Emotionale Profile
            </p>
            <p className=" text-sm font-bold text-gray-500">
              Album Artwork, Favorite Tracks und echte Musik-Signaturen —
              cinematic inszeniert.
            </p>
          </div>
          <a
            href="/loggin"
            className="flex justify-center items-center w-full md:w-100  font-extrabold text-2xl md:text-4xl  p-2 text-yellow-500 bg-white shadow border-b-amber-100 border-t-2 border-t-white border-b-2 hover:bg-yellow-50 hover:shadow-md rounded-2xl "
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
            className="flex justify-center items-center w-full md:w-100  font-extrabold text-2xl md:text-4xl  p-2 text-yellow-500 bg-white shadow border-b-amber-100 border-t-2 border-t-white border-b-2 hover:bg-yellow-50 hover:shadow-md rounded-2xl"
            ><svg
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
          <div className="flex flex-col items-center justify-center gap-1 border-2 bg-yellow-100 border-yellow-300 rounded-2xl p-6 shadow-2xl text-gray-500">
            <p className="p-4 bg-yellow-50 flex-col-reverse justify-center font-extrabold text-lg sm:text-xl md:text-4xl text-yellow-300 border-1 rounded-2xl shadow-lg">
              Willkommen <a className="text-yellow-500">{user?.name}</a>!
              <a className=" items-center justify-center text-sm md:text-xl mt-30 ml-10 text-gray-500  rounded-2xl ">
              Deine nächsten Musik-Matches warten. Swipe durch Vibes, nicht
              durch Formulare.
            </a>
            </p>

            

            <button
              className=" active:inset-shadow-amber-100 bg-yellow-50 border-b-2 border-b-amber-100 border-t-2 border-t-white mt-10 font-extrabold text-lg md:text-3x p-2 text-yellow-500 shadow hover:bg-yellow-50 hover:shadow-md rounded-2xl"
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
