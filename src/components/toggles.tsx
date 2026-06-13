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
  const router = useRouter();

  async function toggle(lang: string) {
    await fetch("/api/locale", { method: "POST", body: JSON.stringify({ locale: lang }) });
    router.refresh();
  }

  return (
    <div className="relative flex items-center">
      <Globe size={14} className="absolute left-2 text-muted-foreground pointer-events-none" />
      <select
        onChange={e => toggle(e.target.value)}
        defaultValue=""
        className="appearance-none bg-transparent pl-6 pr-2 py-1.5 text-xs rounded-lg hover:bg-accent transition-colors cursor-pointer text-muted-foreground focus:outline-none"
        aria-label="Select language"
      >
        <option value="" disabled hidden>Lang</option>
        <option value="en">English</option>
        <option value="om">Afaan Oromo</option>
      </select>
    </div>
  );
}
