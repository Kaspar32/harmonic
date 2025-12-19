"use client";
import { useEffect, useRef } from "react";

export default function HeartAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  const heartsCount = 10;

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: HTMLImageElement[] = []; //Array mit allen erzeugten <img> herzen

    for (let i = 0; i < heartsCount; i++) {
      const heart = document.createElement("img");

      heart.src = "/images/heartForAnimation.svg";
      heart.style.position = "absolute";
      heart.style.bottom = "-100px";

      // random grösse zwischen 20-50px in dem fall
      const size = 40 + Math.random() * 70;
      heart.style.width = `${size}px`;
      heart.style.height = `${size}px`;

      // random dichte
      heart.style.opacity = `${0.4 + Math.random() * 0.6}`;

      heart.dataset.left = `${Math.random() * window.innerWidth}`; //random startposition in pixel

      heart.dataset.offset = `${Math.random() * Math.PI * 5}`; //random phase der horizontalen wellenbewegung

      // delay
      heart.dataset.delay = `${Math.random() * 5000}`;

      containerRef.current.appendChild(heart);
      elements.push(heart);
    }

    let startTime: number; //speichert den zeitpunk des animationsbeginns
    const duration = 4000; // 4sek bis ganz oben
    const textDuration = 5000;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      elements.forEach((heart) => {
        const delay = parseFloat(heart.dataset.delay!);

        const t = Math.max(0, Math.min(1, (elapsed - delay) / duration)); //

        const left = parseFloat(heart.dataset.left!);
        const phase = parseFloat(heart.dataset.offset!);

        // wellenbewegung horizontal
        const wave = Math.sin(t * Math.PI * 4 + phase) * 30;

        // der aufstieg nach oben
        const y = -t * (window.innerHeight + 100); //+100 weil sonst bleiben die im bildschirm stuck lol

        heart.style.transform = `translate(${left + wave}px, ${y}px)`;
      });

      const matchText = document.getElementById("matchText");
      if (matchText === null) return;

      const t = Math.max(0, Math.min(1, elapsed / textDuration));
      const matchTextScale = (0.5 + t) * 1;
      const opacity = 1 - t;

      matchText.style.opacity = opacity.toString();
      matchText.style.transform = `translate(-50%, -100%) scale(${matchTextScale})`;

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        id="matchText"
        className="text-red-500 text-6xl md:text-8xl text-shadow-lg font-bold absolute outlineText"
      >
        MATCH
      </div>

      <div className="absolute inset-0 overflow-hidden" ref={containerRef} />
    </div>
  );
}
