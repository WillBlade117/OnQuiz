import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "../../lib/db";
import { RowDataPacket } from "mysql2";

// Fonction pour déterminer le grade en fonction du score total
const getGrade = (score: number) => {
  if (score < 50) return { title: "Apprenti Curieux", icon: "🥉", color: "text-amber-700 dark:text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", border: "border-amber-200 dark:border-amber-800" };
  if (score < 250) return { title: "Amateur Éclairé", icon: "🥈", color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" };
  if (score < 750) return { title: "Challenger Redoutable", icon: "🥇", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-800" };
  if (score < 1500) return { title: "Expert Reconnu", icon: "💎", color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/30", border: "border-cyan-200 dark:border-cyan-800" };
  if (score < 3000) return { title: "Maître du Quiz", icon: "👑", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-200 dark:border-purple-800" };
  return { title: "Légende Vivante", icon: "🌌", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", border: "border-indigo-200 dark:border-indigo-800" };
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  let stats = {
    credits: 0,
    freeGamesLeft: 0,
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    avgScore: "0.0",
    perfectRate: 0,
    globalRank: 0,
    favoriteTheme: "-",
    recentGames: [] as any[]
  };

  try {
    // 1. Récupération des infos de base de l'utilisateur
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id, credits FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length > 0) {
      const userId = users[0].id;
      stats.credits = users[0].credits || 0;

      // 2. Statistiques de jeu (Parties, Score global, Meilleur score, Perfects)
      const [statsResult] = await db.execute<RowDataPacket[]>(
        `SELECT 
          COUNT(id) as totalGames, 
          COALESCE(SUM(score), 0) as totalScore, 
          COALESCE(MAX(score), 0) as bestScore,
          SUM(CASE WHEN score = 10 THEN 1 ELSE 0 END) as perfectGames
         FROM scores WHERE user_id = ?`,
        [userId]
      );

      const totalGames = statsResult[0].totalGames;
      const totalScore = statsResult[0].totalScore;
      const perfectGames = statsResult[0].perfectGames || 0;

      // 3. Calcul de la position dans le classement mondial
      const [rankResult] = await db.execute<RowDataPacket[]>(
        "SELECT COUNT(*) + 1 as globalRank FROM (SELECT SUM(score) as total FROM scores GROUP BY user_id) as leaderboard WHERE total > ?",
        [totalScore]
      );

      // 4. Calcul des parties jouées aujourd'hui pour la jauge gratuite
      const [todayResult] = await db.execute<RowDataPacket[]>(
        "SELECT COUNT(id) as todayGames FROM scores WHERE user_id = ? AND DATE(created_at) = CURDATE()",
        [userId]
      );
      
      // 5. Thème favori
      const [favoriteThemeResult] = await db.execute<RowDataPacket[]>(
        `SELECT theme, COUNT(id) as playedCount 
         FROM scores WHERE user_id = ? 
         GROUP BY theme ORDER BY playedCount DESC LIMIT 1`,
        [userId]
      );

      // 6. Historique récent
      const [recentGames] = await db.execute<RowDataPacket[]>(
        "SELECT theme, score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
        [userId]
      );

      // --- Compilation des résultats ---
      stats = {
        credits: stats.credits,
        freeGamesLeft: Math.max(0, 3 - todayResult[0].todayGames),
        totalGames: totalGames,
        totalScore: totalScore,
        bestScore: statsResult[0].bestScore,
        avgScore: totalGames > 0 ? (totalScore / totalGames).toFixed(1) : "0.0",
        perfectRate: totalGames > 0 ? Math.round((perfectGames / totalGames) * 100) : 0,
        globalRank: rankResult[0].globalRank,
        favoriteTheme: favoriteThemeResult.length > 0 ? favoriteThemeResult[0].theme : "-",
        recentGames: recentGames
      };
    }
  } catch (error) {
    console.error("Erreur de récupération du profil:", error);
  }

  const userGrade = getGrade(stats.totalScore);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 transition-colors duration-300">
      
      <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        
        <div className={`absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full blur-3xl opacity-20 pointer-events-none ${userGrade.bg}`}></div>

        {session.user?.image && (
          <div className="relative shrink-0">
            <Image 
              src={session.user.image} 
              alt={`Avatar de ${session.user.name}`} 
              width={120}
              height={120}
              className={`h-28 w-28 md:h-32 md:w-32 rounded-full border-4 object-cover shadow-lg ${userGrade.border}`}
            />
            <div className={`absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 text-xl shadow-sm ${userGrade.bg}`}>
              {userGrade.icon}
            </div>
          </div>
        )}
        
        <div className="text-center md:text-left z-10 w-full">
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
              {session.user?.name}
            </h1>
            <span className={`px-3 py-1 text-sm font-black uppercase tracking-wider rounded-lg ${userGrade.bg} ${userGrade.color}`}>
              {userGrade.title}
            </span>
          </div>
          <p className="text-slate-500 font-medium dark:text-slate-400">
            {session.user?.email}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Parties Gratuites</div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{stats.freeGamesLeft} / 3 <span className="text-slate-400 font-medium ml-1">aujourd'hui</span></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 px-4 py-2">
              <span className="text-lg">🪙</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 dark:text-indigo-500">Portefeuille</div>
                <div className="text-sm font-black text-indigo-700 dark:text-indigo-400">{stats.credits} <span className="font-medium ml-1">crédits</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 px-2">Tableau de Chasse</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 mb-12">
        <div className="col-span-2 lg:col-span-2">
          <StatCard title="Classement Mondial" value={`#${stats.globalRank}`} icon="🌍" highlight="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <StatCard title="Score Cumulé" value={stats.totalScore} icon="🌟" highlight="text-amber-500" />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <StatCard title="Parties Jouées" value={stats.totalGames} icon="🎮" />
        </div>
        <div className="col-span-1 lg:col-span-1">
          <StatCard title="Meilleur Score" value={stats.bestScore} icon="🏆" />
        </div>
        
        <div className="col-span-2 lg:col-span-2">
          <StatCard title="Moyenne" value={`${stats.avgScore} / 10`} icon="🎯" />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <StatCard title="Taux de Perfects" value={`${stats.perfectRate}%`} icon="🔥" />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <StatCard title="Thème Favori" value={stats.favoriteTheme} icon="❤️" />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Dernières parties</h2>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {stats.recentGames.length === 0 ? (
            <p className="p-6 text-center text-slate-500">Aucune partie jouée pour le moment.</p>
          ) : (
            stats.recentGames.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {game.theme}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    {new Date(game.created_at).toLocaleString("fr-FR", { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                  </span>
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

function StatCard({ title, value, icon, highlight }: { title: string, value: string | number, icon: string, highlight?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:-translate-y-1 hover:shadow-md transition-all">
      <div className="mb-3 text-3xl">{icon}</div>
      <div className={`text-2xl font-black text-center ${highlight || "text-slate-800 dark:text-white"}`}>
        {value}
      </div>
      <div className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">{title}</div>
    </div>
  );
}