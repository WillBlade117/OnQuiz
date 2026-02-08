"use client";

import { useState, useEffect } from "react";

// --- TYPES ---
interface ScoreEntry {
  player: string;
  theme: string;
  score: number;
  date: string;
}

const THEMES = [
  "Culture", "Histoire", "Science", "Geographie", "Cinema",
  "Sport", "Musique", "Jeux-Video", "Informatique", "Mythologie"
];

export default function Leaderboard() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [theme, setTheme] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard${theme ? `?theme=${theme}` : ""}`)
      .then((res) => res.json())
      .then((data) => {
        setScores(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur classement:", err);
        setLoading(false);
      });
  }, [theme]);

  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  const scoresPerPage = 10;
  const totalPages = Math.ceil(sortedScores.length / scoresPerPage) || 1;
  const paginatedScores = sortedScores.slice((page - 1) * scoresPerPage, page * scoresPerPage);

  const getRankStyle = (index: number) => {
    const realRank = (page - 1) * scoresPerPage + index;
    // Couleurs Or / Argent / Bronze adaptées au Dark Mode
    if (realRank === 0) return "bg-yellow-100 text-yellow-700 ring-yellow-400/30 dark:bg-yellow-900/30 dark:text-yellow-500 dark:ring-yellow-500/50";
    if (realRank === 1) return "bg-slate-200 text-slate-700 ring-slate-400/30 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-500/50";
    if (realRank === 2) return "bg-orange-100 text-orange-700 ring-orange-400/30 dark:bg-orange-900/30 dark:text-orange-500 dark:ring-orange-500/50";
    return "bg-slate-50 text-slate-500 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:ring-slate-700";
  };

  const getMedal = (index: number) => {
    const realRank = (page - 1) * scoresPerPage + index;
    if (realRank === 0) return "🥇";
    if (realRank === 1) return "🥈";
    if (realRank === 2) return "🥉";
    return realRank + 1;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 transition-colors duration-300">
      
      {/* Header du classement */}
      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Classement</h1>
          <p className="text-slate-500 font-medium dark:text-slate-400">Les meilleurs esprits de OnQuiz</p>
        </div>

        {/* Filtre par thème */}
        <div className="relative">
          <select
            className="appearance-none w-64 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm outline-none ring-blue-500/20 transition-all focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-blue-500/40"
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tous les thèmes</option>
            {THEMES.map((t) => (
              <option key={t} value={t.toLowerCase()}>{t}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            ▼
          </div>
        </div>
      </div>

      {/* Conteneur Tableau */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Rang</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Joueur</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Thème</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400 animate-pulse">Chargement des champions...</td>
              </tr>
            ) : paginatedScores.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400">Aucun record pour le moment. Soyez le premier !</td>
              </tr>
            ) : (
              paginatedScores.map((score, index) => (
                <tr key={index} className="group transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                  <td className="px-6 py-4">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ring-1 ring-inset ${getRankStyle(index)}`}>
                      {getMedal(index)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{score.player}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {score.theme}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-indigo-600 dark:text-indigo-400">
                    {score.score} <span className="text-[10px] text-slate-400">PTS</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer du tableau avec Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/30">
          <p className="text-xs font-bold text-slate-400">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-30 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}