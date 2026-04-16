"use client";

import { useEffect, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

export default function Settings() {
  const [interest, setInterest] = useState("");
  const [alter, setAlter] = useState<number[]>([20, 50]);
  const [interestLocation, setInterestLocation] = useState("");

  function handleInteressiertAn(event: React.ChangeEvent<HTMLSelectElement>) {
    setInterest(event.target.value);
  }

  //Post handler
  async function handleAlterChange() {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alter: alter,
          intresse: interest,
          interest_location: interestLocation,
        }),
      });

      console.log(res);
    } catch (error) {
      console.error(error);
    }

    // zururckweisugn der seite zu home
    window.location.href = "/home";
  }

  function deleteaccount() {}

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");

        if (res.ok) {
          const settingsData = await res.json();

          settingsData[0].alter = setAlter(settingsData[0].alter);

          setInterest(settingsData[0].intresse);

          setInterestLocation(settingsData[0].interest_location);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchSettings();
  }, []);

  return (
    <div className="w-md flex flex-col justify-center">
      <div className="bg-white border-2 border-yellow-200 rounded-2xl shadow-xl shadow-amber-900/10 p-6 w-full space-y-4">
        <h2 className="text-lg font-semibold text-yellow-500 text-center">
          Intressiert an:
        </h2>
        <div className="flex flex-col items-center space-y-2">
          <select
            onChange={handleInteressiertAn}
            value={interest}
            className="w-full px-4 py-2 border border-yellow-300 rounded-xl text-yellow-600 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-300 transition duration-200"
          >
            <option value="mann">Mann</option>
            <option value="frau">Frau</option>
            <option value="divers">Divers</option>
            <option value="alle">Alle</option>
          </select>
          <label className="block text-lg font-semibold text-yellow-500 text-center">
            Alter: {alter[0]} – {alter[1]} Jahre
          </label>

          <Slider.Root
            className="relative flex items-center select-none w-full h-5"
            value={alter}
            min={18}
            max={100}
            step={1}
            onValueChange={setAlter}
          >
            {/* Track */}
            <Slider.Track className="bg-gray-700 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-yellow-400 rounded-full h-full" />
            </Slider.Track>

            {/* Daumen (Handles) */}
            <Slider.Thumb className="block w-5 h-5 rounded-full bg-yellow-400 shadow-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <Slider.Thumb className="block w-5 h-5 rounded-full bg-yellow-400 shadow-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
          </Slider.Root>

          {/* In der Nähe Toggel */}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6 text-yellow-500"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM6.262 6.072a8.25 8.25 0 1 0 10.562-.766 4.5 4.5 0 0 1-1.318 1.357L14.25 7.5l.165.33a.809.809 0 0 1-1.086 1.085l-.604-.302a1.125 1.125 0 0 0-1.298.21l-.132.131c-.439.44-.439 1.152 0 1.591l.296.296c.256.257.622.374.98.314l1.17-.195c.323-.054.654.036.905.245l1.33 1.108c.32.267.46.694.358 1.1a8.7 8.7 0 0 1-2.288 4.04l-.723.724a1.125 1.125 0 0 1-1.298.21l-.153-.076a1.125 1.125 0 0 1-.622-1.006v-1.089c0-.298-.119-.585-.33-.796l-1.347-1.347a1.125 1.125 0 0 1-.21-1.298L9.75 12l-1.64-1.64a6 6 0 0 1-1.676-3.257l-.172-1.03Z"
              clipRule="evenodd"
            />
          </svg>
          <div className="mt-1 ml-10">
            <label className="screen-reader-only" htmlFor="choice"></label>
            <span className="mr-10 text-yellow-600  bold" aria-hidden="true">
              Alle!
            </span>
            <input
              onChange={(e) => setInterestLocation(e.target.value)}
              value={interestLocation}
              className="text-yellow-600 shadow-lg rounded-2xl border-t-2 border-slate-200 w-15"
              type="range"
              max="1"
              id="choice"
              name="choice"
            ></input>
            <span className="ml-6 text-yellow-600 bold" aria-hidden="true">
              In der Nähe (gleiche Stadt)
            </span>
          </div>

          <button
            onClick={handleAlterChange}
            className="mt-4 px-4 py-2 bg-yellow-400 text-white rounded"
          >
            Speichern
          </button>
        </div>

        <button
          onClick={deleteaccount}
          className="w-full px-4 py-2 border border-yellow-300 rounded-xl text-yellow-600"
        >
          Konto Löschen
        </button>
      </div>
    </div>
  );
}
