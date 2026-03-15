import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "../../lib/db";
import { RowDataPacket } from "mysql2";
import AdminNav from "./components/AdminNav";
import Image from "next/image";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  let stats = {
    totalUsers: 0,
    totalGames: 0,
    avgScore: 0,
    topTheme: "-",
  };
  let recentGames: any[] = [];

  try {
    const [usersResult] = await db.execute<RowDataPacket[]>("SELECT COUNT(id) as count FROM users");
    stats.totalUsers = usersResult[0].count;

    const [gamesResult] = await db.execute<RowDataPacket[]>("SELECT COUNT(id) as count FROM scores");
    stats.totalGames = gamesResult[0].count;

    const [avgResult] = await db.execute<RowDataPacket[]>("SELECT AVG(score) as avgScore FROM scores");
    stats.avgScore = avgResult[0].avgScore ? Math.round(avgResult[0].avgScore * 10) / 10 : 0;

    const [themeResult] = await db.execute<RowDataPacket[]>(
      "SELECT theme, COUNT(id) as count FROM scores GROUP BY theme ORDER BY count DESC LIMIT 1"
    );
    if (themeResult.length > 0) {
      stats.topTheme = themeResult[0].theme;
    }

    const [recentResult] = await db.execute<RowDataPacket[]>(`
      SELECT s.id, s.score, s.theme, s.created_at, s.player, u.image 
      FROM scores s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `);
    recentGames = recentResult;

  } catch (error) {
    console.error("Erreur SQL Dashboard Admin:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tableau de Bord</h1>
        <p className="text-slate-500 font-medium">Vue d'ensemble de l'activité de votre application.</p>
      </div>

      <AdminNav />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Joueurs Inscrits</span>
          <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{stats.totalUsers}</span>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Parties Jouées</span>
          <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{stats.totalGames}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Score Moyen</span>
          <span className="text-4xl font-black text-amber-500">{stats.avgScore} <span className="text-lg text-slate-400">pts</span></span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Thème Favori</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate mt-auto">{stats.topTheme}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="font-bold text-slate-800 dark:text-white">Activité Récente en direct</h2>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentGames.length === 0 ? (
            <p className="p-6 text-center text-slate-500">Aucune partie n'a été jouée récemment.</p>
          ) : (
            recentGames.map((game) => (
              <div key={game.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                    {game.image ? (
                      <Image src={game.image} alt="Avatar" width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{game.player}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                        {game.theme}
                      </span>
                      • {new Date(game.created_at).toLocaleString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-xl font-black text-slate-800 dark:text-slate-200">
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