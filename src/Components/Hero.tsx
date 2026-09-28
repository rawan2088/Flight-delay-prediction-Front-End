import React, {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";

const Globe3D = lazy(() => import("./Globe3D")); // three.js loads as its own chunk

// Scroll progress p (0 → 1) is written to a CSS variable; everything below is pure CSS math on it.
const CSS = `
.fade-up{opacity:0;animation:fadeUp .8s ease-out forwards}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
.t-title{opacity:calc(1 - .6*clamp(0,(var(--p) - .1)/.5,1));transform:scale(calc(1 - .1*clamp(0,(var(--p) - .1)/.5,1)))}
.t-earth{opacity:clamp(0,(var(--p) - .08)/.3,1)}
.t-text{opacity:clamp(0,(var(--p) - var(--s))/.12,1);transform:translateY(calc((1 - clamp(0,(var(--p) - var(--s))/.12,1))*18px))}
.t-hint{opacity:calc(1 - clamp(0,var(--p)/.06,1))}
.typing{display:inline-block;max-width:100%;overflow:hidden;white-space:nowrap;width:0;border-right:2px solid #60a5fa}
.typing.on{animation:typing 2s steps(35) forwards,caret .8s step-end infinite}
@keyframes typing{to{width:35ch}}
@keyframes caret{50%{border-color:transparent}}
@media (prefers-reduced-motion:reduce){.fade-up{animation:none;opacity:1}.typing.on{animation:none;width:auto}}
`;

const TITLE_FONT = '"Google Sans Flex", system-ui, sans-serif';
const TITLE_WEIGHT = 500;
// One title line, scaled so its width fills the container exactly
const FitLine: React.FC<{ text: string; start: number }> = ({
  text,
  start,
}) => {
  const box = useRef<HTMLDivElement>(null);
  const span = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const fit = () => {
      const b = box.current,
        sp = span.current;
      if (!b || !sp) return;
      sp.style.fontSize = "100px"; // measure at a known size, then scale
      const size = (100 * b.clientWidth) / sp.offsetWidth;
      sp.style.fontSize = `${Math.min(size, window.innerHeight * 0.44)}px`; // never taller than the screen
    };
    fit();
    // observe the fixed-size parent, not the line itself, to avoid a resize loop
    const ro = new ResizeObserver(fit);
    ro.observe(box.current!.parentElement!);
    document.fonts?.load(`${TITLE_WEIGHT} 100px "Google Sans Flex"`).then(fit);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div ref={box} className="w-full text-center leading-[0.9]">
      <span
        ref={span}
        aria-hidden
        className="inline-block whitespace-nowrap tracking-tighter"
        style={{
          fontFamily: TITLE_FONT,
          fontWeight: TITLE_WEIGHT,
          letterSpacing: "0.03em",
        }}
      >
        {text.split("").map((c, i) => (
          <span
            key={i}
            className=" fade-up inline-block px-[0.02em] pt-[0.1em] pb-[0.2em] -mt-[0.1em] -mb-[0.2em] bg-gradient-to-b from-blue-100 via-blue-400 to-blue-700 bg-clip-text text-transparent"
            style={{ animationDelay: `${start + i * 0.07}s` }}
          >
            {c}
          </span>
        ))}
      </span>
    </div>
  );
};
const at = (start: number) => ({ "--s": start }) as React.CSSProperties;

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const outer = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true); // render the 3D scene only while the stage is on screen
  const [interactive, setInteractive] = useState(false); // plane becomes clickable once it has appeared
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const o = outer.current,
        s = stage.current;
      if (!o || !s) return;
      const r = o.getBoundingClientRect();
      const travel = o.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / travel));
      progress.current = p;
      s.style.setProperty("--p", p.toFixed(4)); // no React re-render per scroll tick
      setActive(r.bottom > 0);
      setInteractive(p > 0.5);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goPlane = () => navigate(isAuthenticated ? "/predict" : "/login");

  return (
    <section ref={outer} className="relative" style={{ height: "300vh" }}>
      <style>{CSS}</style>
      {/* sticky stage: stays on screen while the section scrolls past */}
      <div
        ref={stage}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ "--p": 0 } as React.CSSProperties}
      >
        {/* 1. Title fills the screen, then recedes behind the planet */}
        <h1
          aria-label="FlightPredict"
          className="t-title absolute inset-0 z-0 flex flex-col justify-center px-[2vw] select-none"
        >
          <FitLine text="Flight" start={0.1} />
          <FitLine text="Predict" start={0.6} />
        </h1>

        <div className="t-hint pointer-events-none absolute bottom-8 inset-x-0 z-10 flex flex-col items-center gap-1 text-sm text-gray-400">
          Scroll
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>

        {/* 2. Planet grows in as you scroll */}
        <div
          className={`t-earth absolute inset-0 z-10 ${interactive ? "" : "pointer-events-none"}`}
        >
          <Suspense fallback={null}>
            <Globe3D
              onPlaneClick={goPlane}
              active={active}
              progress={progress}
            />{" "}
          </Suspense>
        </div>

        {/* 3. Text around the planet, one block after another */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between px-6 pt-24 pb-8 md:px-12 [text-shadow:0_1px_12px_rgba(0,0,0,.8)]">
          <div className="hidden md:flex justify-between">
            <div className="t-text max-w-[16rem]" style={at(0.5)}>
              <p className="text-lg font-semibold text-white">
                AI-powered flight delay predictions
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Know how late, or early, you will land.
              </p>
            </div>
            <div className="t-text max-w-[16rem] text-right" style={at(0.58)}>
              <p className="text-lg font-semibold text-white">
                Three inputs, one answer
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Pick a route, a date and a time. Get an estimate in seconds.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 items-center text-center md:text-left">
            <div
              className="t-text hidden md:block max-w-[16rem]"
              style={at(0.66)}
            >
              <p className="text-lg font-semibold text-white">
                Learns from history
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Trained on historical flight data.
              </p>
            </div>

            <div className="t-text md:text-right" style={at(0.74)}>
              {isAuthenticated ? (
                <p className="font-mono text-blue-300 mb-4">
                  Welcome back, {user?.username}.
                </p>
              ) : (
                <p className="font-mono text-blue-300 mb-4 min-h-6">
                  <span className={`typing ${interactive ? "on" : ""}`}>
                    Sign in to try the prediction agent
                  </span>
                </p>
              )}
              <div className="pointer-events-auto flex gap-3 justify-center md:justify-end">
                {isAuthenticated ? (
                  <Link
                    to="/predict"
                    className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open prediction agent
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-7 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="px-7 py-3 bg-slate-800/80 text-white font-semibold rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Or click the plane orbiting the Earth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
