"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-indigo-600 transition-transform hover:scale-105 dark:text-indigo-400">
          OnQuiz
        </Link>

        <div className="flex items-center gap-3">

          {status === "loading" ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
          ) : session ? (
            <>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex h-10 items-center gap-2 rounded-full pl-1 pr-3 ring-1 transition-all hover:scale-105 ${
                    isMenuOpen 
                      ? "bg-slate-200 ring-slate-300 dark:bg-slate-700 dark:ring-slate-600" 
                      : "bg-slate-100 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
                  }`}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profil"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                      👤
                    </div>
                  )}
                  <span className="hidden text-sm font-bold text-slate-700 dark:text-slate-200 sm:block">
                    {session.user?.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-1 hidden sm:block">▼</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      
                      <Link
                        href="/profil"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span className="text-lg">👤</span> Mon Profil
                      </Link>

                      {session.user?.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors mt-1"
                        >
                          <span className="text-lg">⚙️</span> Panel Admin
                        </Link>
                      )}

                      <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

                      <div className="px-3 py-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Apparence</span>
                        <div className="mt-2 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                          <button
                            onClick={() => setTheme("light")}
                            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${theme === "light" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                          >
                            Clair
                          </button>
                          <button
                            onClick={() => setTheme("dark")}
                            className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-colors ${theme === "dark" ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                          >
                            Foncé
                          </button>
                        </div>
                      </div>

                      <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span className="text-lg">🚪</span> Déconnexion
                      </button>

                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("discord")}
              className="flex h-10 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-indigo-700"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}