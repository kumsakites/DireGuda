"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CreditCard, Bell, Users, Menu, X, UserCircle, LogOut } from "lucide-react";
import { ThemeToggle, LanguageToggle } from "./toggles";
import Footer from "./footer";

interface Props {
  role?: string;
  unreadCount?: number;
  children: React.ReactNode;
}

const SIDEBAR_W = 256; // px — w-64

export default function AppShell({ role, unreadCount = 0, children }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard, badge: 0 },
    { href: "/payments", label: t("payments"), icon: CreditCard, badge: 0 },
    { href: "/notifications", label: t("notifications"), icon: Bell, badge: unreadCount },
    { href: "/profile", label: "Profile", icon: UserCircle, badge: 0 },
    ...(role === "admin" ? [{ href: "/admin/users", label: t("admin"), icon: Users, badge: 0 }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-background border-b border-border/20"
      >
        <button onClick={() => setOpen(o => !o)} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label={t("logout")}>
            <LogOut size={15} />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -SIDEBAR_W }} animate={{ x: 0 }} exit={{ x: -SIDEBAR_W }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 bottom-0 z-20 flex flex-col p-3 gap-1 bg-sidebar shadow-xl overflow-y-auto"
            style={{ width: SIDEBAR_W, paddingTop: "3.5rem" }}
          >
            {links.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}>
                  <span className={`p-1.5 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "group-hover:bg-accent"}`}>
                    <Icon size={16} />
                  </span>
                  {label}
                  {badge > 0 && (
                    <span className="ml-auto bg-destructive text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Backdrop (mobile only) ────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Page content ─────────────────────────────────────── */}
      <div className="pt-14 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <Footer />
      </div>

    </div>
  );
}
