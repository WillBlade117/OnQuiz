import Link from "next/link";
import Image from "next/image";
import { THEMES } from "../lib/constants";

export default function Home() {
  const topThemes = THEMES.slice(0, 4);
  const middleLeftTheme = THEMES.slice(4, 5)[0];
  const middleRightTheme = THEMES.slice(5, 6)[0];
  const bottomThemes = THEMES.slice(6, 10);

  const renderThemeCard = (theme: (typeof THEMES)[0]) => (
    <Link
      key={theme.name}
      href={`/quiz/${theme.name.toLowerCase()}`}
      className="group relative flex flex-col items-center justify-center rounded-3xl border border-slate-200/50 bg-white/90 p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-2 hover:ring-blue-500/20 dark:border-slate-800/50 dark:bg-slate-900/90 dark:shadow-none dark:hover:ring-blue-400/20"
    >
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.color} text-3xl text-white shadow-lg transition-transform group-hover:scale-110 group-active:scale-95`}
      >
        {theme.icon}
      </div>
      <span className="text-center text-sm font-black uppercase tracking-wide text-slate-800 dark:text-slate-200">
        {theme.name}
      </span>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 transition-opacity group-hover:opacity-100 dark:via-white/5 dark:to-white/10"></div>
    </Link>
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="/imgBibliotheque.jpg"
        alt="Décor de bibliothèque"
        fill
        priority
        className="object-cover object-center"
      />

      <div className="absolute inset-0 z-0 bg-slate-50/40 transition-colors duration-300 dark:bg-slate-900/50"></div>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 dark:text-white md:text-8xl">
            On
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Quiz
            </span>
          </h1>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 md:text-3xl">
            Prouvez votre valeur. Dominez le classement.
          </h2>
          <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
          <p className="mt-8 text-lg font-medium text-slate-800 dark:text-slate-300">
            L'arène du savoir vous attend. Choisissez votre discipline :
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6 animate-in fade-in zoom-in-95 duration-1000 delay-150">
          {/* LIGNE 1 : 4 Thèmes */}
          {topThemes.map(renderThemeCard)}

          {/* LIGNE 2 : 1 Thème + Mort Subite (Largeur x2) + 1 Thème */}
          {renderThemeCard(middleLeftTheme)}

          <Link
            href="/mort-subite"
            className="group relative col-span-2 flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl shadow-red-900/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-900/40 hover:ring-2 hover:ring-red-500/50 dark:border-red-500/20"
          >
            {/* Effet de lueur rouge en fond */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)] transition-opacity group-hover:opacity-100 opacity-50"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-3xl text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform group-hover:scale-110 group-active:scale-95">
                💀
              </div>
              <span className="text-center text-lg font-black uppercase tracking-widest text-white">
                Mort Subite
              </span>
              <span className="mt-1 text-center text-xs font-bold text-red-400">
                1 seule erreur = Game Over
              </span>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </Link>

          {renderThemeCard(middleRightTheme)}

          {/* LIGNE 3 : 4 Thèmes */}
          {bottomThemes.map(renderThemeCard)}
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 border-t border-slate-300/50 pt-12 text-center dark:border-slate-800/50">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-500">
            Seuls les meilleurs entreront dans l'histoire
          </p>
          <Link
            href="/classement"
            className="group flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-blue-50"
          >
            🏆 Consulter le Panthéon
          </Link>
        </div>
      </main>
    </div>
  );
}
