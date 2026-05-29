"use client";
import { useUser } from "@/app/context/UserContext";
import { useNotification } from "./context/NotificationContext";


export default function Test() {

  const {user} = useUser();



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
        <>
        <p className="p-4 flex-row justify-center font-extrabold text-lg sm:text-xl md:text-4xl text-yellow-300 border-1 rounded-2xl shadow-lg">
          Willkommen <a className="text-yellow-500">{user?.name}</a>!

          

          <div className="flex-row mt-5">
          <a className="w-20 items-center justify-center text-sm md:text-2xl mt-30 text-gray-500  rounded-2xl ">
            Deine nächsten Musik-Matches warten. 
            Swipe durch Vibes, nicht durch Formulare.
          </a>

          
          
          
          </div>
        </p>

        <button className=" border-2 border-yellow-400 rounded-2xl shadow-2xl p-4 mt-10 text-yellow-400 font-extrabold text-lg md:text-3xl hover:bg-yellow-100 transition-colors duration-300">

            Zum Discover-Flow
          </button>
        </>
      )}

    </div>
  );
}
