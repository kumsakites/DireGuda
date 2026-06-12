"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Sun, Moon, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function LanguageToggle() {
  const t = useTranslations("nav");
  const router = useRouter();

  async function toggle(lang: string) {
    await fetch("/api/locale", { method: "POST", body: JSON.stringify({ locale: lang }) });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <Globe size={16} className="text-muted-foreground" />
      <button onClick={() => toggle("en")} className="text-xs hover:underline px-1">EN</button>
      <span className="text-muted-foreground">|</span>
      <button onClick={() => toggle("om")} className="text-xs hover:underline px-1">OM</button>
    </div>
  );
}
