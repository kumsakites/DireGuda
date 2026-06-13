"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CreditCard, Bell, Users, Menu, X, UserCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { ThemeToggle, LanguageToggle } from "./toggles";

interface NavProps { role?: string; unreadCount?: number }

export default function Nav({ role, unreadCount = 0 }: NavProps) {
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
    <>
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-background border-b border-border/20">
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

      {/* ── Drawer (all screen sizes) ─────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed left-0 top-14 bottom-0 w-64 bg-sidebar z-50 flex flex-col p-3 gap-1 shadow-xl overflow-y-auto"
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
