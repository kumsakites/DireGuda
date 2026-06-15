"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

// ─── Static admin profiles ────────────────────────────────────────────────────

const ADMINS = [
  { username: "Mr. Getachew Mekonnen",      avatar: "/Gech.jpg"  },
  { username: "Mr. Kaba Sori",              avatar: "/kabaa.jpg" },
  { username: "Engineer Gudeta Mekonnen",   avatar: "/Gude.jpg"  },
  { username: "Dr. Galata Tasfa",           avatar: "/Dr.jpg"    },
];

// ─── Admin marquee card ───────────────────────────────────────────────────────

function AdminCard({ username, avatar }: { username: string; avatar?: string }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shrink-0 mx-3">
      {avatar ? (
        <img src={avatar} alt={username} className="w-10 h-10 rounded-full object-cover border-2 border-[#F2722B]" />
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-[#F2722B]"
          style={{ background: "linear-gradient(135deg,#F2722B,#e05a1a)" }}>
          {initials}
        </div>
      )}
      <div>
        <p className="text-white font-semibold text-sm leading-tight">{username}</p>
        <p className="text-white/60 text-xs flex items-center gap-1"><ShieldCheck size={10} /> Admin</p>
      </div>
    </div>
  );
}

function AdminMarquee({ admins }: { admins: { username: string; avatar?: string }[] }) {
  // Need at least 4 visible slots — repeat until we have enough
  const items = admins.length === 0
    ? [{ username: "Admin" }]
    : admins.length < 4
    ? [...admins, ...admins, ...admins, ...admins].slice(0, Math.max(8, admins.length * 4))
    : [...admins, ...admins]; // double for seamless loop

  return (
    <div className="w-full overflow-hidden py-3" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <motion.div
        className="flex"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: items.length * 3, repeat: Infinity, ease: "linear" }}
      >
        {items.map((a, i) => (
          <AdminCard key={i} username={a.username} avatar={(a as { username: string; avatar?: string }).avatar} />
        ))}
      </motion.div>
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
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* Background: rural school photo */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80')" }} />

      {/* Overlay: brand gradient #F2722B → #1E1E24 */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(242,114,43,0.82) 0%, rgba(30,30,36,0.88) 60%, rgba(30,30,36,0.95) 100%)" }} />

      {/* Content */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
              style={{ background: "#F2722B" }}>D</div>
            <span className="text-white font-bold text-lg tracking-wide">DireGuda</span>
          </div>
          <span className="text-white/50 text-xs">Member Payment System</span>
        </div>

        {/* Main area — login card left, tagline right */}
        <div className="flex flex-1 items-center px-6 md:px-16 gap-12 py-8">

          {/* Login card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-sm shrink-0"
          >
            <div className="rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>

              {/* Card header strip */}
              <div className="px-7 pt-7 pb-4">
                <div className="w-12 h-1 rounded-full mb-4" style={{ background: "#F2722B" }} />
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-white/60 text-sm mt-1">Sign in to your member account</p>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-4">
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-300 text-center bg-red-500/10 rounded-lg py-2 px-3">
                    {error}
                  </motion.p>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80" htmlFor="username">{t("username")}</label>
                  <input id="username" name="username" required autoComplete="username"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 transition"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                    onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #F2722B")}
                    onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                    placeholder="Enter your username" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80" htmlFor="password">{t("password")}</label>
                  <div className="relative">
                    <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                      className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-white/30 outline-none transition"
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                      onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #F2722B")}
                      onBlur={e => (e.currentTarget.style.boxShadow = "none")}
                      placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                      aria-label="Toggle password visibility">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-[0.98]"
                  style={{ background: loading ? "#c4581a" : "linear-gradient(135deg,#F2722B,#e05a1a)", boxShadow: "0 4px 20px rgba(242,114,43,0.4)" }}>
                  {loading ? "Signing in…" : t("signIn")}
                </button>

                <p className="text-center text-sm text-white/50">
                  <a href="/forgot-password" className="hover:text-[#F2722B] transition-colors">Forgot password?</a>
                </p>
              </form>
            </div>
          </motion.div>

          {/* Right tagline — hidden on small screens */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block flex-1"
          >
            <p className="text-5xl font-black text-white leading-tight" style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
              We Are From<br />
              <span style={{ color: "#F2722B" }}>Dirree Guddaa</span>
            </p>
            <p className="text-white/60 mt-4 text-lg max-w-md">
              A united community managing contributions transparently and efficiently.
            </p>
          </motion.div>
        </div>

        {/* Bottom admin marquee */}
        <div className="pb-6 px-4">
          <div className="rounded-2xl overflow-hidden py-1"
            style={{ background: "rgba(30,30,36,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-center text-white/40 text-xs mb-2 tracking-widest uppercase">System Administrators</p>
            <AdminMarquee admins={ADMINS} />
          </div>
        </div>

      </div>
    </div>
  );
}
