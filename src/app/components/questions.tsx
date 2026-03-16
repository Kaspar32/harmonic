"use client";
import React, { use, useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";

export default function Questions() {
  interface Questions {
    question1?: string;
    question2?: string;
    question3?: string;
    question4?: string;
    question5?: string;
    question6?: string;
  }

  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");
  const [question3, setQuestion3] = useState("");
  const [question4, setQuestion4] = useState("");
  const [question5, setQuestion5] = useState("");
  const [question6, setQuestion6] = useState("");

  const {user} = useUser();

  async function saveAnswers() {
    

    let payload = {
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      uuid: user?.uuid,
    };

    const res = await fetch("/api/savequestionaire", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
  const [answers, setAnswers] = useState<Questions>({});

  useEffect(() => {
    const loadData = async () => {
    

  

      const res = await fetch("api/savequestionaire" + `?uuid=${user?.uuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      console.log("Empfangene antworten:", data[0].answers.question1);
      setAnswers(data[0].answers);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (answers?.question1) {
      setQuestion1(answers.question1);
    }

    if (answers?.question3) {
      setQuestion3(answers.question3);
    }
    if (answers?.question6) {
      setQuestion6(answers.question6);
    }
  }, [answers]);

  return (
    <div className="flex flex-col min-h-screen py-2 overflow-y-auto">
      <h1 className="mt-10 text-4xl font-bold text-yellow-500">Fragen</h1>

      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Welches ist dein Lieblingsopenair?
      </p>

      <select
        onChange={(e) => setQuestion1(e.target.value)}
        value={question1}
        className="w-[200] ml-5 mt-2 text-gray-400 dark:text-black appearance-none focus:outline-none"
      >
        <option className="bg-gray-200">Auswählen</option>
        <option>St.Galler OpenAir</option>
        <option>Gampel Open Air</option>
        <option>Greenfield Open Air</option>
        <option>Zürich Festival</option>
        <option>Gurten Open Air</option>
        <option>Glastonbury Open Air</option>
        <option>Tomorrowland</option>
        <option>...</option>
      </select>

      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Machst du auch Musik?
      </p>

      <div className="mt-5 ml-10">
        <label className="screen-reader-only" htmlFor="choice"></label>
        <span className="mr-10 text-gray-400" aria-hidden="true">
          Nein
        </span>
        <input
          onChange={(e) => setQuestion2(e.target.value)}
          defaultValue={answers?.question2}
          className="bg-yellow-600 shadow-lg rounded-2xl border-t-2 border-slate-200 w-15"
          type="range"
          max="1"
          id="choice"
          name="choice"
        ></input>
        <span className="ml-10 text-gray-400" aria-hidden="true">
          Ja
        </span>
      </div>

      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Welches Instrument spielst du?
      </p>

      <select
        onChange={(e) => setQuestion3(e.target.value)}
        value={question3}
        className="w-[200] ml-5 mt-2 text-gray-400 dark:text-black appearance-none focus:outline-none"
      >
        <option className="bg-gray-200">Auswählen</option>
        <option>Gitarre</option>
        <option>Schlagzeug</option>
        <option>Piano/Keyboard</option>
        <option>Violine/Viola/Bratsche</option>
        <option>Saxophone</option>
        <option>Klarinette</option>
        <option>...</option>
      </select>

      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Gehst du auf Raves?
      </p>

      <div className="mt-5 ml-10">
        <label className="screen-reader-only" htmlFor="choice"></label>
        <span className="mr-10 text-gray-400" aria-hidden="true">
          Nein
        </span>
        <input
          onChange={(e) => setQuestion4(e.target.value)}
          defaultValue={answers?.question4}
          className="bg-yellow-600 shadow-lg rounded-2xl w-15"
          type="range"
          max="1"
          id="choice"
          name="choice"
        ></input>
        <span className="ml-10 text-gray-400" aria-hidden="true">
          Ja
        </span>
      </div>

      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Magst du klassische Musik und Opern?
      </p>

      <div className="mt-2 ml-10">
        <label className="screen-reader-only" htmlFor="choice"></label>
        <span className="mr-10 text-gray-400" aria-hidden="true">
          Nein
        </span>
        <input
          onChange={(e) => setQuestion5(e.target.value)}
          defaultValue={answers?.question5}
          className="bg-yellow-600 shadow-lg rounded-2xl w-15"
          type="range"
          max="1"
          id="choice"
          name="choice"
        ></input>
        <span className="ml-10 text-gray-400" aria-hidden="true">
          Ja
        </span>
      </div>
      <p className="text-yellow-400 border-1 rounded-2xl p-2 mt-2 font-bold shadow-xl border-t-2 border-slate-200">
        Was für eine Genre hörst du im Flugzeug?
      </p>

      <select
        onChange={(e) => setQuestion6(e.target.value)}
        value={question6 || ""}
        className="w-[200] ml-5 mt-2 text-gray-400 dark:text-black appearance-none focus:outline-none"
      >
        <option className="bg-gray-200">Auswählen</option>
        <option>Ambient</option>
        <option>Klassik</option>
        <option>Hardsytle</option>
        <option>Jazz</option>
        <option>...</option>
      </select>

      <button
        onClick={() => {saveAnswers()}}
        className="bg-yellow-400 text-white rounded-2xl p-2 mt-2 shadow-lg"
      >
        Speichern
      </button>
    </div>
  );
}
