'use client';

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/50 p-2 text-xl transition-all hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}