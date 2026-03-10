"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  // data contient les infos du joueur (nom, avatar), status dit s'il est "loading", "authenticated", ou "unauthenticated"
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            On<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Quiz</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* Logique d'affichage du bouton de connexion */}
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800"></div>
          // ... (Le reste du Header ne change pas)
          ) : session ? (
            <div className="flex items-center gap-4">
              {/* ON ENGLOBE L'AVATAR ET LE NOM DANS UN LINK */}
              <Link href="/profil" className="group flex items-center gap-3 rounded-full bg-slate-50 dark:bg-slate-800/50 pr-4 pl-1 py-1 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Avatar" 
                    className="h-8 w-8 rounded-full ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all"
                  />
                )}
                <span className="hidden text-sm font-bold text-slate-700 dark:text-slate-300 md:block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {session.user?.name}
                </span>
              </Link>
              
              <button 
                onClick={() => signOut()}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              >
                Quitter
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn("discord")}
              className="flex items-center gap-2 rounded-full bg-[#5865F2] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#5865F2]/30 transition-transform hover:scale-105 hover:bg-[#4752C4] active:scale-95"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
              Discord
            </button>
          )}
        </div>
      </div>
    </header>
  );
}