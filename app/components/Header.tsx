import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="group flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-2xl font-black tracking-tighter text-transparent transition-all duration-300 group-hover:bg-gradient-to-l">
            OnQuiz
          </span>
          <span className="hidden rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 sm:block">
            BETA
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/classement"
            className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-indigo-500/30 active:translate-y-0"
          >
            <span>🏆</span>
            <span>Classement</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}