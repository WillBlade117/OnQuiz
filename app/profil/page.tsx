"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GameHistory {
  theme: string;
  score: number;
  created_at: string;
}

interface UserStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  favoriteTheme: string;
  recentGames: GameHistory[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }

    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) setStats(data);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 transition-colors duration-300">
      {/* En-tête du profil */}
      <div className="mb-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
        {session.user?.image && (
          <img 
            src={session.user.image} 
            alt="Avatar" 
            className="h-24 w-24 rounded-full ring-4 ring-indigo-500/30 shadow-xl"
          />
        )}
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Profil de {session.user?.name}
          </h1>
          <p className="mt-2 text-slate-500 font-medium dark:text-slate-400">
            {session.user?.email}
          </p>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-12">
        <StatCard title="Parties Jouées" value={stats?.totalGames || 0} icon="🎮" />
        <StatCard title="Score Cumulé" value={stats?.totalScore || 0} icon="🌟" />
        <StatCard title="Meilleur Score" value={stats?.bestScore || 0} icon="🏆" />
        <StatCard title="Thème Favori" value={stats?.favoriteTheme || "-"} icon="❤️" />
      </div>

      {/* Historique récent */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Dernières parties</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {stats?.recentGames.length === 0 ? (
            <p className="p-6 text-center text-slate-500">Aucune partie jouée pour le moment.</p>
          ) : (
            stats?.recentGames.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {game.theme}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(game.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {game.score} <span className="text-sm text-slate-400 font-medium">pts</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Petit composant réutilisable pour les cartes
function StatCard({ title, value, icon }: { title: string, value: string | number, icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1 transition-transform">
      <div className="mb-2 text-3xl">{icon}</div>
      <div className="text-2xl font-black text-slate-800 dark:text-white">{value}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</div>
    </div>
  );
}