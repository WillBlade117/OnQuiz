import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-100 py-8 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 text-center md:flex-row md:justify-between md:text-left">
        
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            OnQuiz Project
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {currentYear} Tous droits réservés.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="https://www.william-sart.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            William SART
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-indigo-600 transition-all group-hover:w-full dark:bg-indigo-400"></span>
          </Link>
        </div>
      </div>
    </footer>
  );
}