"use client";

import { useEffect, useState } from "react";
import * as Slider from "@radix-ui/react-slider";

export default function Settings() {
  const [interest, setInterest] = useState("");
  const [alter, setAlter] = useState<number[]>([20, 50]);

  function handleInteressiertAn(event: React.ChangeEvent<HTMLSelectElement>) {
    setInterest(event.target.value);
  }

  //Post handler
  async function handleAlterChange() {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alter: alter, intresse: interest }),
      });

      console.log(res);
      
    } catch (error) {
      console.error(error);
    }

    // zururckweisugn der seite zu home
    window.location.href = "/home";
  }

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");

        if (res.ok) {
          const settingsData = await res.json();

          settingsData[0].alter = setAlter(settingsData[0].alter);

          setInterest(settingsData[0].intresse);
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

          <button
            onClick={handleAlterChange}
            className="mt-4 px-4 py-2 bg-yellow-400 text-white rounded"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
