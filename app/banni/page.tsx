import Link from "next/link";

export default function BannedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <span className="text-5xl">🛑</span>
        </div>
        <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">
          Accès refusé
        </h1>
        <p className="mb-8 text-lg font-medium text-slate-500 dark:text-slate-400">
          Votre compte a été suspendu par un administrateur de OnQuiz.
        </p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-transform hover:scale-105 dark:bg-white dark:text-slate-900"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}