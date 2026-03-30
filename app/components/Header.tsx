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
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [balance, setBalance] = useState({ credits: 0, freeGamesLeft: 0 });
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fermer le menu déroulant du profil si on clique à côté
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginModalOpen]);

  // Charger le solde quand on ouvre le menu
  useEffect(() => {
    if (isMenuOpen && session) {
      setIsLoadingBalance(true);
      fetch("/api/user/balance")
        .then((res) => res.json())
        .then((data) => {
          setBalance(data);
          setIsLoadingBalance(false);
        });
    }
  }, [isMenuOpen, session]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/60 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-black text-indigo-600 transition-transform hover:scale-105 dark:text-indigo-400"
          >
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
                    <span className="text-xs text-slate-400 ml-1 hidden sm:block">
                      ▼
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2">
                        <div className="mb-2 mx-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200">
                          {isLoadingBalance ? (
                            <span className="animate-pulse text-slate-400">
                              Chargement...
                            </span>
                          ) : (
                            <>
                              <span
                                title="Parties gratuites restantes"
                                className="flex items-center gap-1"
                              >
                                ⚡ {balance.freeGamesLeft}/3
                              </span>
                              <span
                                title="Vos crédits"
                                className="flex items-center gap-1"
                              >
                                🪙 {balance.credits}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

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
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Apparence
                          </span>
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
                onClick={() => setIsLoginModalOpen(true)}
                className="flex h-10 items-center justify-center rounded-full bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-indigo-700"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </header>

      {/* POP-UP (MODALE) DE CONNEXION */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Overlay invisible cliquable pour fermer la modale en cliquant à côté */}
          <div
            className="absolute inset-0"
            onClick={() => setIsLoginModalOpen(false)}
          ></div>

          {/* Contenu de la modale */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Fermer"
            >
              ✕
            </button>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl dark:bg-indigo-900/30">
              👋
            </div>

            <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white">
              Rejoignez l'arène !
            </h3>

            <p className="mb-8 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Connectez-vous pour sauvegarder votre progression, grimper dans le
              classement en temps réel et débloquer vos{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">
                parties gratuites
              </strong>{" "}
              tous les jours.
            </p>

            {/* Vrai bouton Discord */}
            <button
              onClick={() => signIn("discord")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#5865F2] px-5 py-4 font-bold text-white shadow-lg transition-all hover:bg-[#4752C4] hover:shadow-indigo-500/25 active:scale-95"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Se connecter avec Discord
            </button>

            <p className="mt-5 text-xs font-medium text-slate-400">
              Connexion sécurisée et rapide.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
