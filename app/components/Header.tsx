"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        <Link href="/" className="flex items-center gap-2 text-xl font-black text-indigo-600 transition-transform hover:scale-105 dark:text-indigo-400">
          OnQuiz
        </Link>

        <div className="flex items-center gap-3">
          
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
          ) : session ? (
            <>
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  title="Panel Administrateur"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200 transition-all hover:scale-105 hover:bg-slate-200 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
                >
                  <span className="text-xl">⚙️</span>
                </Link>
              )}

              <Link
                href="/profil"
                className="flex h-10 items-center gap-2 rounded-full bg-slate-100 pl-1 pr-3 ring-1 ring-slate-200 transition-all hover:scale-105 hover:bg-slate-200 dark:bg-slate-800 dark:ring-slate-700 dark:hover:bg-slate-700"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Profil"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                    👤
                  </div>
                )}
                <span className="hidden text-sm font-bold text-slate-700 dark:text-slate-200 sm:block">
                  {session.user?.name}
                </span>
              </Link>
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