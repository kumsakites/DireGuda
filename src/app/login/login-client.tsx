"use client";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, ShieldCheck, Send, Target, Eye as EyeIcon, Flag, Star, Heart, Mail, Phone, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// ─── Static admin profiles ────────────────────────────────────────────────────

const ADMINS = [
  { name: "Mr. Getachew Mekonnen",    avatar: "/Gech.jpg"  },
  { name: "Mr. Kaba Sori",           avatar: "/kabaa.jpg" },
  { name: "Engineer Gudeta Mekonnen",avatar: "/Gude.jpg"  },
  { name: "Dr. Galata Tasfa",        avatar: "/Dr.jpg"    },
];

// ─── Individual admin cards (separate, not marquee) ──────────────────────────

function AdminCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 pb-6">
      {ADMINS.map((a) => (
        <motion.div key={a.name}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl text-center"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
          {/* Fixed size img — avoids Vercel fill/layout issues */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.avatar}
            alt={a.name}
            width={80}
            height={80}
            className="rounded-full object-cover border-2 border-[#F2722B]"
            style={{ width: 80, height: 80 }}
          />
          <div>
            <p className="text-white font-semibold text-sm leading-snug">{a.name}</p>
            <p className="text-white/50 text-xs flex items-center justify-center gap-1 mt-1">
              <ShieldCheck size={10} /> Administrator
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function InfoCard({ icon, title, text, delay }: { icon: React.ReactNode; title: string; text: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}
      className="rounded-2xl p-6 space-y-3"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(242,114,43,0.2)" }}>
        <span style={{ color: "#F2722B" }}>{icon}</span>
      </div>
      <h3 className="text-white font-bold text-lg">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-[#0F172A] mb-6">Send Us a Message</h2>
      {status === "sent" ? (
        <div className="text-center py-8 space-y-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: "#F2722B" }}>
            <Send size={24} className="text-white" />
          </div>
          <p className="text-[#0F172A] font-semibold text-lg">Message sent!</p>
          <p className="text-gray-500 text-sm">We'll get back to you soon.</p>
          <button onClick={() => setStatus("idle")} className="mt-2 text-sm text-[#F2722B] hover:underline">Send another</button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Full Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#F2722B] transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Email Address *</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#F2722B] transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="+251 xxx xxx xxx"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#F2722B] transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0F172A] block mb-1">Message *</label>
            <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us about your project..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#F2722B] transition resize-none" />
          </div>
          {status === "error" && <p className="text-red-500 text-sm">Failed to send. Please try again.</p>}
          <button type="submit" disabled={status === "sending"}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#F2722B,#e05a1a)", boxShadow: "0 4px 20px rgba(242,114,43,0.35)" }}>
            {status === "sending" ? "Sending…" : <><Send size={15} /> Send Message</>}
          </button>
        </form>
      )}
    </motion.div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

const SOCIALS = [
  { label: "Facebook", href: "https://web.facebook.com/kumsa.kitessa/", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { label: "Telegram", href: "https://t.me/kumsakitessa", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg> },
  { label: "Instagram", href: "https://www.instagram.com/kumsakitessa", svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg> },
];

function LandingFooter() {
  return (
    <footer className="w-full pt-12 pb-6 px-6" style={{ background: "rgba(15,15,20,0.85)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm text-white/50">
        <div className="space-y-3">
          <p className="font-semibold text-white text-base">Location</p>
          <a href="https://www.google.com/maps/search/Bole,+Addis+Ababa,+Ethiopia" target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-2 hover:text-[#F2722B] transition-colors">
            <MapPin size={14} className="mt-0.5 shrink-0" /> Bole, Addis Ababa, Ethiopia
          </a>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-white text-base">Contact</p>
          <a href="mailto:kumsakitessa12@gmail.com" className="flex items-center gap-2 hover:text-[#F2722B] transition-colors">
            <Mail size={14} /> kumsakitessa12@gmail.com
          </a>
          <a href="tel:+251917534343" className="flex items-center gap-2 hover:text-[#F2722B] transition-colors">
            <Phone size={14} /> +251 917 534 343
          </a>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-white text-base">Follow Us</p>
          <div className="flex gap-4">
            {SOCIALS.map(({ label, href, svg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="hover:text-[#F2722B] hover:scale-110 transition-all">{svg}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/30">
        <span>All Rights Reserved © 2026 DireGuda</span>
        <span>Developed by Kumsa Kitessa</span>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function LoginClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  async function switchLang(lang: string) {
    await fetch("/api/locale", { method: "POST", body: JSON.stringify({ locale: lang }) });
    router.refresh();
  }

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

  const inputStyle = {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
  };

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ background: "#0f0f14" }}>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80"
            alt="School background" fill className="object-cover object-center" priority unoptimized />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(242,114,43,0.80) 0%, rgba(30,30,36,0.88) 55%, rgba(15,15,20,0.97) 100%)" }} />

        <div className="relative flex flex-col min-h-screen" style={{ zIndex: 2 }}>
          {/* Navbar */}
          <nav className="flex items-center justify-between px-6 md:px-12 pt-6 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
                style={{ background: "#F2722B" }}>D</div>
              <span className="text-white font-bold text-lg tracking-wide">DireGuda</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center gap-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(255,255,255,0.1)" }}>
                <Globe size={13} className="text-white/60" />
                <select onChange={e => switchLang(e.target.value)} defaultValue=""
                  className="appearance-none bg-transparent text-xs text-white/70 cursor-pointer focus:outline-none pr-1">
                  <option value="" disabled hidden>Lang</option>
                  <option value="en">English</option>
                  <option value="om">Afaan Oromo</option>
                </select>
              </div>
              <button onClick={() => contactRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg,#F2722B,#e05a1a)", boxShadow: "0 4px 16px rgba(242,114,43,0.4)" }}>
                Get Started
              </button>
            </div>
          </nav>

          {/* Hero content */}
          <div className="flex flex-1 items-center px-6 md:px-12 gap-12 py-8">
            {/* Login card */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }} className="w-full max-w-sm shrink-0">
              <div className="rounded-2xl shadow-2xl"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div className="px-7 pt-7 pb-4">
                  <div className="w-12 h-1 rounded-full mb-4" style={{ background: "#F2722B" }} />
                  <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                  <p className="text-white/60 text-sm mt-1">Sign in to your member account</p>
                </div>
                <form onSubmit={handleSubmit} className="px-7 pb-7 space-y-4">
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-300 text-center bg-red-500/10 rounded-lg py-2 px-3">{error}</motion.p>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80" htmlFor="username">{t("username")}</label>
                    <input id="username" name="username" required autoComplete="username"
                      placeholder="Enter your username"
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #F2722B")}
                      onBlur={e => (e.currentTarget.style.boxShadow = "none")} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-white/80" htmlFor="password">{t("password")}</label>
                    <div className="relative">
                      <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                        placeholder="Enter your password"
                        className="w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-white placeholder-white/30 outline-none transition"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.boxShadow = "0 0 0 2px #F2722B")}
                        onBlur={e => (e.currentTarget.style.boxShadow = "none")} />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                        aria-label="Toggle password visibility">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg,#F2722B,#e05a1a)", boxShadow: "0 4px 20px rgba(242,114,43,0.4)" }}>
                    {loading ? "Signing in…" : t("signIn")}
                  </button>
                  <p className="text-center text-sm text-white/50">
                    <a href="/forgot-password" className="hover:text-[#F2722B] transition-colors">Forgot password?</a>
                  </p>
                </form>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} className="hidden lg:block flex-1">
              <p className="text-5xl font-black text-white leading-tight" style={{ textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}>
                We Are From<br /><span style={{ color: "#F2722B" }}>Dirree Guddaa</span>
              </p>
              <p className="text-white/60 mt-4 text-lg max-w-md">
                A united community managing contributions transparently and efficiently.
              </p>
            </motion.div>
          </div>

          {/* Admin cards */}
          <div className="pb-6 px-4">
            <p className="text-center text-white/40 text-xs mb-4 tracking-widest uppercase">System Administrators</p>
            <AdminCards />
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION / GOALS / VALUES ── */}
      <section className="relative py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center space-y-3">
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: "rgba(242,114,43,0.15)", color: "#F2722B" }}>About Us</div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Who We Are</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              DireGuda is a community organisation from Dirree Guddaa committed to collective growth, transparency, and mutual support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard delay={0} icon={<Target size={20} />} title="Our Mission"
              text="To empower members of Dirree Guddaa through transparent financial management, regular contributions, and collective investment in education and community development." />
            <InfoCard delay={0.1} icon={<EyeIcon size={20} />} title="Our Vision"
              text="To become a model community organisation where every member thrives through shared resources, accountability, and mutual trust — rooted in our heritage." />
            <InfoCard delay={0.2} icon={<Flag size={20} />} title="Our Goal"
              text="Establish a sustainable fund that supports education, emergency assistance, and community projects for all members and their families in Dirree Guddaa." />
            <InfoCard delay={0.3} icon={<Star size={20} />} title="Our Objective"
              text="Collect monthly contributions, track payment history transparently, rank contributors, and ensure every birr is accounted for and put to meaningful use." />
            <InfoCard delay={0.4} icon={<Heart size={20} />} title="Our Values"
              text="Integrity, transparency, unity, and respect. We believe that community strength comes from honest communication and shared commitment to collective wellbeing." />
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3"
              style={{ background: "linear-gradient(135deg,rgba(242,114,43,0.2),rgba(242,114,43,0.05))", border: "1px solid rgba(242,114,43,0.3)" }}>
              <p className="text-5xl font-black" style={{ color: "#F2722B" }}>4</p>
              <p className="text-white font-bold text-lg">Founding Administrators</p>
              <p className="text-white/50 text-sm">Dedicated leaders steering the organisation</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section ref={contactRef} className="py-20 px-6 md:px-12"
        style={{ background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center space-y-3 mb-12">
            <div className="inline-block px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ background: "rgba(242,114,43,0.15)", color: "#F2722B" }}>Contact</div>
            <h2 className="text-3xl md:text-4xl font-black text-white">Get In Touch</h2>
            <p className="text-white/50 max-w-md mx-auto">Have a question or want to join? Send us a message and we'll get back to you.</p>
          </motion.div>
          <ContactForm />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <LandingFooter />
    </div>
  );
}
