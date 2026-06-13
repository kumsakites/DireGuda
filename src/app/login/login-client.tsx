"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/toggles";

// ─── Dot canvas — each dot travels corner-to-corner across the full screen ───

interface Dot {
  x: number; y: number;
  tx: number; ty: number;   // current target corner
  speed: number;
  r: number; opacity: number; pulseOffset: number;
}

const CORNERS = (w: number, h: number) => [
  [0, 0], [w, 0], [w, h], [0, h],
  [w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2],  // edge midpoints for variety
];

function randomCorner(w: number, h: number, excludeX?: number, excludeY?: number) {
  const corners = CORNERS(w, h).filter(([cx, cy]) => cx !== excludeX || cy !== excludeY);
  return corners[Math.floor(Math.random() * corners.length)];
}

function DotsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  const init = useCallback((w: number, h: number) => {
    sizeRef.current = { w, h };
    const count = Math.min(Math.floor((w * h) / 7000), 130);
    dotsRef.current = Array.from({ length: count }, () => {
      const [tx, ty] = randomCorner(w, h);
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        tx, ty,
        speed: 0.6 + Math.random() * 1.2,
        r: 2 + Math.random() * 2.5,
        opacity: 0.4 + Math.random() * 0.5,
        pulseOffset: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      init(canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    function draw() {
      const { width: w, height: h } = canvas!;
      ctx.clearRect(0, 0, w, h);
      t += 0.012;
      const dots = dotsRef.current;

      // Connecting lines between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(99,130,255,${(1 - dist / 130) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      for (const d of dots) {
        // Move toward target corner
        const dx = d.tx - d.x;
        const dy = d.ty - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < d.speed + 1) {
          // Reached target — pick a new corner
          d.x = d.tx; d.y = d.ty;
          const [nx, ny] = randomCorner(w, h, d.tx, d.ty);
          d.tx = nx; d.ty = ny;
        } else {
          d.x += (dx / dist) * d.speed;
          d.y += (dy / dist) * d.speed;
        }

        const pulse = d.r + Math.sin(t + d.pulseOffset) * 0.9;
        const alpha = d.opacity * (0.8 + Math.sin(t * 0.7 + d.pulseOffset) * 0.2);

        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, pulse * 2.8);
        grad.addColorStop(0, `rgba(130,160,255,${alpha})`);
        grad.addColorStop(0.5, `rgba(99,120,230,${alpha * 0.55})`);
        grad.addColorStop(1, `rgba(80,100,200,0)`);
        ctx.beginPath(); ctx.arc(d.x, d.y, pulse * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        ctx.beginPath(); ctx.arc(d.x, d.y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(170,190,255,${alpha})`; ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [init]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} aria-hidden />;
}

// ─── Tagline — centers 5s, drifts within screen 5s, fades out, repeats ───────

function TaglineOverlay({ visible }: { visible: boolean }) {
  const text = "We Are From Dirree Guddaa";
  // opacity controlled separately so we can hold it at 1 for 5s
  const [opacity, setOpacity] = useState(0);
  const [left, setLeft] = useState("50%");
  const [top, setTop] = useState("50%");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    if (!visible) {
      setOpacity(0);
      return;
    }

    // Reset to center, no movement transition
    setTransitioning(false);
    setLeft("50%");
    setTop("50%");
    setOpacity(0);

    // Fade in
    const t0 = setTimeout(() => setOpacity(1), 50);

    // After 5s: enable movement transition and move to random spot
    const t1 = setTimeout(() => {
      const pad = 15; // % from edges
      const newLeft = `${pad + Math.random() * (100 - pad * 2)}%`;
      const newTop = `${pad + Math.random() * (100 - pad * 2)}%`;
      setTransitioning(true);
      setLeft(newLeft);
      setTop(newTop);
    }, 5000);

    // After 10s: fade out
    const t2 = setTimeout(() => setOpacity(0), 10000);

    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!visible && opacity === 0) return null;

  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        zIndex: 10,
        left,
        top,
        transform: "translate(-50%, -50%)",
        opacity,
        transition: [
          "opacity 0.7s ease",
          transitioning ? "left 5s ease-in-out, top 5s ease-in-out" : "",
        ].filter(Boolean).join(", "),
      }}
      aria-hidden
    >
      <p className="text-center whitespace-nowrap flex items-center gap-3"
        style={{ fontSize: "clamp(1.2rem, 3.2vw, 2.8rem)", fontWeight: 800, lineHeight: 1.2 }}>
        {text.split("").map((char, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              background: "linear-gradient(135deg,#6382ff 0%,#a78bfa 50%,#60c4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 14px rgba(99,130,255,0.65))",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
        <span style={{ fontSize: "clamp(1rem, 2.8vw, 2.4rem)", filter: "drop-shadow(0 0 10px rgba(255,120,180,0.7))" }}>
          🫶
        </span>
      </p>
    </div>
  );
}

// ─── Intro animation (inside the card, before form appears) ──────────────────

type Phase = "alone" | "together" | "done";

function LoginAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("alone");
  const [aloneAttempts, setAloneAttempts] = useState(0);

  useEffect(() => {
    if (phase === "alone") {
      if (aloneAttempts < 3) {
        const t = setTimeout(() => setAloneAttempts(a => a + 1), 900);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("together"), 400);
      return () => clearTimeout(t);
    }
    if (phase === "together") {
      const t = setTimeout(() => onDone(), 2000);
      return () => clearTimeout(t);
    }
  }, [phase, aloneAttempts, onDone]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-6">
      <AnimatePresence mode="wait">
        {phase === "alone" && (
          <motion.div key="alone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">Trying alone…</p>
            <div className="flex items-end gap-3">
              <motion.div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-primary" />
                <div className="w-4 h-8 rounded bg-primary/70" />
              </motion.div>
              <motion.div key={aloneAttempts} className="w-3 h-14 rounded bg-destructive"
                animate={{ x: [0, -4, 4, -4, 0] }} transition={{ duration: 0.4 }} />
            </div>
            <motion.p key={aloneAttempts} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive font-medium">
              {aloneAttempts === 0 ? "Can't break through…" : aloneAttempts === 1 ? "Trying again…" : "Still failing…"}
            </motion.p>
          </motion.div>
        )}
        {phase === "together" && (
          <motion.div key="together" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">Together we push…</p>
            <div className="flex items-end gap-1">
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} className="flex flex-col items-center gap-1"
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}>
                  <div className="w-5 h-5 rounded-full bg-primary" />
                  <div className="w-3 h-7 rounded bg-primary/70" />
                </motion.div>
              ))}
              <motion.div className="w-3 h-14 rounded bg-destructive ml-1"
                animate={{ x: [0, 20, 40, 80], opacity: [1, 1, 0.5, 0] }}
                transition={{ duration: 1.2, delay: 0.6 }} />
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
              className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Goal achieved!</motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LoginClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  // When intro finishes: show form, fire tagline overlay, repeat every 2 min
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleIntroDone() {
    setShowForm(true);
    setShowTagline(true);
    setTimeout(() => setShowTagline(false), 10500);
    intervalRef.current = setInterval(() => {
      setShowTagline(true);
      setTimeout(() => setShowTagline(false), 10500);
    }, 21000);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      username: fd.get("username"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (result?.error) setError(t("invalidCredentials"));
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <>
      <DotsBackground />
      <div className="fixed inset-0 bg-background/55 backdrop-blur-[2px]" style={{ zIndex: 1 }} aria-hidden />
      <TaglineOverlay visible={showTagline} />

      {/* Theme toggle — top-right corner */}
      <div className="fixed top-4 right-4" style={{ zIndex: 20 }}>
        <ThemeToggle />
      </div>

      <main className="relative min-h-screen flex items-center justify-center" style={{ zIndex: 5 }}>
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div key="animation"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-card/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl px-10 py-8 min-w-[300px]">
              <LoginAnimation onDone={handleIntroDone} />
            </motion.div>
          ) : (
            <motion.div key="card"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm rounded-2xl border border-white/10 p-8 shadow-2xl bg-card/80 backdrop-blur-md space-y-4">
              <h1 className="text-2xl font-bold text-center">{t("signIn")}</h1>
              <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {error && <p className="text-sm text-destructive text-center">{error}</p>}
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="username">{t("username")}</label>
                  <input id="username" name="username" required className="w-full rounded-md border px-3 py-2 text-sm bg-background/80" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">{t("password")}</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} required
                      className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background/80" />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {loading ? t("signingIn") : t("signIn")}
                </button>
                <p className="text-center text-sm">
                  <a href="/forgot-password" className="text-primary hover:underline">Forgot password?</a>
                </p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
