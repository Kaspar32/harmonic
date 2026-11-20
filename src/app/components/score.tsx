"use client";
import { evaluateQuestions } from "@/lib/evaluatequestions";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";

type Props = {
  uuid: string;
};

export default function Score({ uuid }: Props) {
  let [score, setScore] = useState(0);

  const {user}= useUser();

  useEffect(() => {
    const loadData = async () => {
      
      const res = await fetch("api/savequestionaire" + `?uuid=${user?.uuid}`, {
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

      setScore(evaluateQuestions(data2[0]?.answers, data[0]?.answers) ?? 0);
    };
    loadData();
  }, []);

  return (
   <div className="flex w-full min-w-0 mb-2">
      <div className="relative w-full min-w-0 bg-gray-200 rounded-2xl h-6 @min-[17rem]:h-8 @min-[23rem]:h-9 overflow-hidden border-yellow-400 border-3">
        <div
          className="bg-yellow-600 h-full transition-all duration-300"
          style={{ width: `${score}%` }}
        />
        <p className="absolute inset-0 flex items-center pl-2 text-xs @min-[17rem]:text-sm @min-[23rem]:text-base text-yellow-500">
          {score}%
        </p>
      </div>
    </div>
  );
}
