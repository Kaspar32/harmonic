"use client";
import { evaluateQuestions } from "@/lib/evaluatequestions";
import { useEffect, useState } from "react";

type Props = {
  uuid: string;
};

export default function Score({ uuid }: Props) {
  let [score, setScore] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const userRes = await fetch("/api/auth", { credentials: "include" });
      const userData = await userRes.json();
      const userUuid = userData.uuid;

      const res = await fetch("api/savequestionaire" + `?uuid=${userUuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      const res2 = await fetch("api/savequestionaire" + `?uuid=${uuid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data2 = await res2.json();

      setScore(evaluateQuestions(data2[0]?.answers, data[0].answers));
    };
    loadData();
  }, []);

  return (
   <div className="flex flex-rows gap-x-20 mb-2">
      <p className="ml-5">Fragen:</p>
      <div className=" w-50 bg-gray-200 rounded-lg h-9 overflow-hidden border-yellow-400 border-3">
        <div
          className="bg-yellow-600 h-9 transition-all duration-300"
          style={{ width: `${score}%` }}
        >
          <p className="text-gray-200 pl-5 pb-1 leading-9">{score}%</p>
        </div>
      </div>
    </div>
  );
}
