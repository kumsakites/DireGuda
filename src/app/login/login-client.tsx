"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "alone" | "together" | "tagline" | "form";

function LoginAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("alone");
  const [aloneAttempts, setAloneAttempts] = useState(0);

  useEffect(() => {
    if (phase === "alone") {
      if (aloneAttempts < 3) {
        const t = setTimeout(() => setAloneAttempts(a => a + 1), 900);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setPhase("together"), 400);
        return () => clearTimeout(t);
      }
    }
    if (phase === "together") {
      const t = setTimeout(() => setPhase("tagline"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "tagline") {
      const t = setTimeout(() => onDone(), 2200);
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
              <motion.div
                key={aloneAttempts}
                className="w-3 h-14 rounded bg-destructive"
                animate={{ x: [0, -4, 4, -4, 0] }}
                transition={{ duration: 0.4 }}
              />
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
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}>
                  <div className="w-5 h-5 rounded-full bg-primary" />
                  <div className="w-3 h-7 rounded bg-primary/70" />
                </motion.div>
              ))}
              <motion.div className="w-3 h-14 rounded bg-destructive ml-1"
                animate={{ x: [0, 20, 40, 80], opacity: [1, 1, 0.5, 0] }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />
            </div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
              className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Goal achieved!
            </motion.p>
          </motion.div>
        )}

        {phase === "tagline" && (
          <motion.div key="tagline" className="text-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {"We are from Dirree Guddaa".split("").map((char, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-xl font-bold text-primary inline-block">
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    if (result?.error) {
      setError(t("invalidCredentials"));
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="animation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 flex items-center justify-center bg-background z-50">
            <LoginAnimation onDone={() => setShowForm(true)} />
          </motion.div>
        ) : (
          <motion.div key="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm rounded-xl border p-8 shadow-lg bg-card space-y-4">
            <h1 className="text-2xl font-bold text-center">{t("signIn")}</h1>
            <motion.form onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-4">
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="username">{t("username")}</label>
                <input id="username" name="username" required
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">{t("password")}</label>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required
                    className="w-full rounded-md border px-3 py-2 pr-10 text-sm bg-background" />
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
  );
}
