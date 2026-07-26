"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("maglo-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const isDarkSys = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = isDarkSys ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", isDarkSys);
    }
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("maglo-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-[#282541] bg-slate-50 dark:bg-[#201e34] px-3.5 py-2 text-xs font-bold text-[#1c1a2e] dark:text-[#c8ee44] hover:bg-slate-100 dark:hover:bg-[#282541] transition-all shadow-sm"
      title="Beralih Tema Terang / Gelap"
    >
      <span>{theme === "light" ? "☀️" : "🌙"}</span>
      <span>{theme === "light" ? "Mode Terang" : "Mode Gelap"}</span>
    </button>
  );
}
