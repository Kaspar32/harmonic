"use client";
import { useEffect, useRef } from "react";

const STAR_POSITIONS = [
  { left: "10%", delay: "0s", size: 8, duration: "3s" },
  { left: "20%", delay: "0.3s", size: 10, duration: "3.5s" },
  { left: "30%", delay: "0.6s", size: 7, duration: "2.8s" },
  { left: "40%", delay: "0.1s", size: 12, duration: "3.2s" },
  { left: "50%", delay: "0.8s", size: 9, duration: "3.8s" },
  { left: "60%", delay: "0.4s", size: 11, duration: "3.1s" },
  { left: "70%", delay: "0.7s", size: 8, duration: "3.4s" },
  { left: "80%", delay: "0.2s", size: 10, duration: "2.9s" },
  { left: "90%", delay: "0.5s", size: 7, duration: "3.6s" },
  { left: "15%", delay: "0.9s", size: 9, duration: "3.3s" },
  { left: "45%", delay: "1.1s", size: 8, duration: "3.7s" },
  { left: "75%", delay: "1.0s", size: 11, duration: "3.0s" },
];

function Star({ left, delay, size, duration }: { left: string; delay: string; size: number; duration: string }) {
  return (
    <div
      className="absolute bottom-0 animate-star-rise"
      style={{ left, animationDelay: delay, animationDuration: duration }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]"
        style={{ width: size * 4, height: size * 4 }}
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function SuperLike_Animation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = container!.getBoundingClientRect();
      canvas!.width = (rect.width ?? 0) * dpr;
      canvas!.height = (rect.height ?? 0) * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const animFrame = { id: 0 };
    const TRAIL_LENGTH = 40;

    // Phase 1: bezier S-curve top to bottom
    const p1Down = { x: w * 0.5, y: h * 0.08 };
    const cp1Down = { x: w * 0.15, y: h * 0.35 };
    const cp2Down = { x: w * 0.85, y: h * 0.65 };
    const p2Down = { x: w * 0.5, y: h * 0.92 };

    // Phase 2: bezier curve left to right
    const p1Right = { x: w * 0.0, y: h * 0.38 };
    const cp1Right = { x: w * 0.3, y: h * 0.22 };
    const cp2Right = { x: w * 0.7, y: h * 0.48 };
    const p2Right = { x: w * 1.0, y: h * 0.38 };

    function getBezierPoint(
      p0: { x: number; y: number },
      c1: { x: number; y: number },
      c2: { x: number; y: number },
      p3: { x: number; y: number },
      t: number
    ) {
      const u = 1 - t;
      return {
        x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
      };
    }

    // Persistent path trail
    const trail: { x: number; y: number; age: number }[] = [];
    let phase: "down" | "right" | "hold" = "down";
    let t = 0;
    const speed = 0.012;
    const holdFrames = 60;
    let holdCount = 0;
    let age = 0;

    function drawHead(x: number, y: number, radius: number) {
      // Outer glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
      glow.addColorStop(0, "rgba(30, 64, 175, 0.7)");
      glow.addColorStop(0.5, "rgba(37, 99, 235, 0.3)");
      glow.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.beginPath();
      ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Core bright dot
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1e3a8a";
      ctx.fill();
    }

    function drawTrail() {
      for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const life = 1 - p.age / TRAIL_LENGTH;
        if (life <= 0) continue;

        const alpha = life * 0.8;
        const radius = 2 + life * 2.5;

        // Glow behind each trail point
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3);
        glow.addColorStop(0, `rgba(30, 64, 175, ${alpha * 0.6})`);
        glow.addColorStop(1, "rgba(59, 130, 246, 0)");
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(30, 64, 175, ${alpha})`;
        ctx!.fill();
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, w, h);

      // Age trail
      for (const p of trail) p.age++;
      while (trail.length > 0 && trail[0].age >= TRAIL_LENGTH) {
        trail.shift();
      }

      drawTrail();

      let headPos: { x: number; y: number } | null = null;

      if (phase === "down") {
        const et = easeInOutCubic(t);
        headPos = getBezierPoint(p1Down, cp1Down, cp2Down, p2Down, et);
        trail.push({ ...headPos, age: 0 });
        t += speed;
        if (t >= 1) {
          t = 0;
          phase = "right";
        }
      } else if (phase === "right") {
        const et = easeInOutCubic(t);
        headPos = getBezierPoint(p1Right, cp1Right, cp2Right, p2Right, et);
        trail.push({ ...headPos, age: 0 });
        t += speed;
        if (t >= 1) {
          phase = "hold";
          holdCount = 0;
        }
      } else {
        holdCount++;
        if (holdCount >= holdFrames) {
          // Fade out trail, show text
          document.getElementById("matchText")?.classList.remove("opacity-0");
          document.getElementById("matchText")?.classList.add("animate-pulse");
          document.getElementById("stars-container")?.classList.remove("opacity-0");
          return;
        }
      }

      if (headPos) {
        drawHead(headPos.x, headPos.y, 4);
      }

      age++;
      animFrame.id = requestAnimationFrame(animate);
    }

    animFrame.id = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrame.id);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden z-[100] bg-blue-300">
      <div
        id="matchText"
        className="opacity-0 text-blue-700 text-6xl md:text-8xl font-extrabold absolute z-10 drop-shadow-[0_0_12px_rgba(30,64,175,0.6)]"
        style={{
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          WebkitTextStroke: "2px rgba(59, 130, 246, 0.4)",
          letterSpacing: "0.08em",
        }}
      >
        SUPERLIKE
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div id="stars-container" className="absolute inset-0 opacity-0 pointer-events-none">
        {STAR_POSITIONS.map((pos, idx) => (
          <Star key={idx} {...pos} />
        ))}
      </div>
    </div>
  );
}
