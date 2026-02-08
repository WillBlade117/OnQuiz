import Link from "next/link";

const THEMES = [
  { name: "Culture", icon: "🧠", color: "from-blue-500 to-cyan-400" },
  { name: "Histoire", icon: "📜", color: "from-amber-500 to-orange-400" },
  { name: "Science", icon: "🧪", color: "from-emerald-500 to-green-400" },
  { name: "Geographie", icon: "🌍", color: "from-sky-500 to-indigo-400" },
  { name: "Cinema", icon: "🎬", color: "from-purple-600 to-pink-500" },
  { name: "Sport", icon: "⚽", color: "from-red-500 to-orange-500" },
  { name: "Musique", icon: "🎵", color: "from-rose-500 to-pink-400" },
  { name: "Jeux-Video", icon: "🎮", color: "from-indigo-600 to-blue-500" },
  { name: "Informatique", icon: "💻", color: "from-slate-700 to-slate-900" },
  { name: "Mythologie", icon: "🔱", color: "from-yellow-600 to-amber-500" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-black tracking-tight text-slate-900 md:text-8xl">
          On<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Quiz</span>
        </h1>
        <h2 className="text-xl font-bold text-slate-700 md:text-3xl">
          10 thèmes | 1000+ questions
        </h2>
        <div className="mx-auto mt-6 h-1.5 w-24 rounded-full bg-blue-500"></div>
        <p className="mt-8 text-lg font-medium text-slate-500">
          Prêt à relever le défi ? Choisissez un thème :
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {THEMES.map((theme) => (
          <Link 
            key={theme.name} 
            href={`/quiz/${theme.name.toLowerCase()}`}
            className="group relative flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-2 hover:ring-blue-500/20"
          >
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.color} text-3xl text-white shadow-lg transition-transform group-hover:scale-110`}>
              {theme.icon}
            </div>
            
            <span className="text-sm font-black uppercase tracking-wide text-slate-800">
              {theme.name}
            </span>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-transparent via-white/10 to-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </Link>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center gap-4 border-t border-slate-100 pt-12 text-center">
        <p className="text-sm font-semibold text-slate-400">
          Enregistrez vos scores pour apparaître dans le haut du panier
        </p>
        <Link 
          href="/classement" 
          className="group flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 font-bold text-white transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95"
        >
          🏆 Voir le classement
        </Link>
      </div>

    </main>
  );
}