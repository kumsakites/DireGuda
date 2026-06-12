"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CreditCard, Bell, Users, LogOut, Menu, X, UserCircle } from "lucide-react";
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

  const navContent = (
    <nav className="flex flex-col gap-1 flex-1">
      {links.map(({ href, label, icon: Icon, badge }) => (
        <Link key={href} href={href} onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
            pathname.startsWith(href)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}>
          <Icon size={18} />
          {label}
          {badge > 0 && (
            <span className="ml-auto bg-destructive text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen border-r bg-sidebar p-4 gap-4">
        <h1 className="font-bold text-lg px-2">DireGuda</h1>
        {navContent}
        <div className="flex items-center gap-2 pt-2 border-t">
          <LanguageToggle />
          <ThemeToggle />
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="ml-auto p-2 rounded hover:bg-accent text-muted-foreground" aria-label={t("logout")}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-sidebar">
        <h1 className="font-bold">DireGuda</h1>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="p-2 rounded hover:bg-accent"><Menu size={20} /></button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r z-50 flex flex-col p-4 gap-4 md:hidden">
              <div className="flex justify-between items-center">
                <h1 className="font-bold text-lg">DireGuda</h1>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-accent"><X size={18} /></button>
              </div>
              {navContent}
              <button onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent">
                <LogOut size={16} /> {t("logout")}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
