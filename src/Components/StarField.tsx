import React, { useEffect, useRef } from "react";

// Fixed, full-screen night sky: deep gradient + ~1 star per 1,800 px², gently twinkling.
const StarField: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let stars: {
      x: number;
      y: number;
      r: number;
      a: number;
      speed: number;
      phase: number;
    }[] = [];
    let raf = 0;
    let lastW = 0;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const s of stars) {
        const twinkle = reduce
          ? 1
          : 0.65 + 0.35 * Math.sin((t / 1000) * s.speed + s.phase);
        ctx.globalAlpha = s.a * twinkle;
        ctx.fillStyle = s.r > 1 ? "#bfdbfe" : "#ffffff"; // a few bigger, bluer stars
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const build = () => {
      // Phones fire resize when the URL bar hides; only rebuild when the width changes
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((window.innerWidth * window.innerHeight) / 1800);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.1 + 0.25,
        a: Math.random() * 0.6 + 0.3,
        speed: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
      }));
      draw(0);
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    build();
    if (!reduce) raf = requestAnimationFrame(loop);
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,#0b1e3f_0%,#030712_65%)]"
    >
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
};

export default StarField;
