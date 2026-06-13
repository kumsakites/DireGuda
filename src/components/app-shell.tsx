"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LayoutDashboard, CreditCard, Bell, Users, Menu, X, UserCircle, LogOut } from "lucide-react";
import { ThemeToggle, LanguageToggle } from "./toggles";
import Footer from "./footer";

interface Props {
  role?: string;
  unreadCount?: number;
  children: React.ReactNode;
}

const SIDEBAR_W = 256;

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
    <div className="flex min-h-screen bg-background">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-20 flex flex-col p-3 gap-1 bg-sidebar shadow-xl overflow-y-auto transition-transform duration-300"
        style={{
          width: SIDEBAR_W,
          paddingTop: "3.5rem",
          transform: open ? "translateX(0)" : `translateX(-${SIDEBAR_W}px)`,
        }}
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
      </aside>

      {/* ── Main area (shifts right when sidebar open) ───────── */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: open ? SIDEBAR_W : 0 }}
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 h-14 flex items-center justify-between px-4 bg-background border-b border-border/20">
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

        {/* ── Page content ──────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>

    </div>
  );
}
