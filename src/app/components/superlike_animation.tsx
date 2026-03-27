import { useEffect, useRef } from "react";

export default function SuperLike_Animation() {
 

  return (
    <div className="relative w-full h-full overflow-hidden z-[100]">
      <div
        id="matchText"
        className="text-blue-500 text-6xl md:text-8xl text-shadow-lg font-bold absolute outlineText2 z-10 animate-pulse"
      >
        SUPERLIKE
      </div>


      <div className="w-full h-full bg-blue-300">
      </div>
    </div>
  );
}
