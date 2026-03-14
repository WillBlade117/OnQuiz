import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "../../lib/db";
import { RowDataPacket } from "mysql2";
import Image from "next/image";
import Link from "next/link";

export default async function LeaderboardPage(props: { searchParams: Promise<{ period?: string }> }) {
  const searchParams = await props.searchParams;
  const period = searchParams.period || "week";
  const session = await getServerSession(authOptions);

  let dateCondition = "WHERE s.user_id IS NOT NULL";
  if (period === "week") {
    dateCondition += " AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
  } else if (period === "month") {
    dateCondition += " AND s.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
  }

  const top50Query = `
    SELECT u.id, u.name, u.image, SUM(s.score) as totalScore
    FROM scores s
    JOIN users u ON s.user_id = u.id
    ${dateCondition}
    GROUP BY u.id
    ORDER BY totalScore DESC
    LIMIT 25
  `;
  const [leaderboard] = await db.execute<RowDataPacket[]>(top50Query);

  let currentUserStats = null;
  if (session?.user?.email) {
    const [userRows] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?", 
      [session.user.email]
    );

    if (userRows.length > 0) {
      const userId = userRows[0].id;
      
      const userScoreQuery = `
        SELECT SUM(score) as total 
        FROM scores s 
        ${dateCondition} AND s.user_id = ?
      `;
      const [userScoreResult] = await db.execute<RowDataPacket[]>(userScoreQuery, [userId]);
      const userTotal = userScoreResult[0].total || 0;

      if (userTotal > 0) {
        const rankQuery = `
          SELECT COUNT(*) + 1 as userRank
          FROM (
            SELECT SUM(score) as totalScore
            FROM scores s
            ${dateCondition}
            GROUP BY s.user_id
          ) as leaderboard
          WHERE totalScore > ?
        `;
        const [rankResult] = await db.execute<RowDataPacket[]>(rankQuery, [userTotal]);
        
        currentUserStats = {
          totalScore: userTotal,
          rank: rankResult[0].userRank
        };
      } else {
        currentUserStats = { totalScore: 0, rank: 0 };
      }
    }
  }

  const getRankIcon = (rank: number) => {
    if (period === "all") return "👑";
    if (period === "month") return "🏆";
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🎖️";
  };

  const getPodiumColors = (rank: number) => {
    if (rank === 1) return "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    if (rank === 2) return "border-slate-300 bg-slate-50 dark:bg-slate-800";
    if (rank === 3) return "border-amber-600 bg-amber-50 dark:bg-amber-900/20";
    return "";
  };

  const top3 = leaderboard.slice(0, 3);
  const restOfPlayers = leaderboard.slice(3, 25);

  const tabs = [
    { id: "week", label: "Cette Semaine" },
    { id: "month", label: "Ce Mois-ci" },
    { id: "all", label: "Général" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 transition-colors duration-300 min-h-screen relative pb-32">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          Classement
        </h1>
        
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 dark:bg-slate-800">
          {tabs.map((tab) => {
            const isActive = period === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/classement?period=${tab.id}`}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-20 text-slate-500 font-medium">
          Aucun score enregistré pour cette période. Soyez le premier !
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 mb-16 pt-10">
            {top3[1] && (
              <div className="order-2 sm:order-1 flex flex-col items-center w-full sm:w-1/3">
                <div className="text-2xl mb-2">{getRankIcon(2)}</div>
                <div className={`w-20 h-20 mb-3 rounded-full border-4 shadow-lg ${getPodiumColors(2)} overflow-hidden`}>
                  {top3[1].image ? (
                    <Image src={top3[1].image} alt={`Avatar de ${top3[1].name}`} width={80} height={80} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white truncate w-full text-center">{top3[1].name}</div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{top3[1].totalScore} pts</div>
                <div className="w-full h-16 bg-gradient-to-t from-slate-200 to-transparent dark:from-slate-800 mt-4 rounded-t-xl opacity-50 hidden sm:block"></div>
              </div>
            )}

            {top3[0] && (
              <div className="order-1 sm:order-2 flex flex-col items-center w-full sm:w-1/3 z-10 sm:-translate-y-6">
                <div className="text-4xl mb-2 animate-bounce">{getRankIcon(1)}</div>
                <div className={`w-28 h-28 mb-3 rounded-full border-4 shadow-xl ${getPodiumColors(1)} overflow-hidden`}>
                  {top3[0].image ? (
                    <Image src={top3[0].image} alt={`Avatar de ${top3[0].name}`} width={112} height={112} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>
                  )}
                </div>
                <div className="font-black text-xl text-slate-900 dark:text-white truncate w-full text-center">{top3[0].name}</div>
                <div className="text-lg font-black text-yellow-600 dark:text-yellow-500">{top3[0].totalScore} pts</div>
                <div className="w-full h-24 bg-gradient-to-t from-yellow-200/50 to-transparent dark:from-yellow-900/30 mt-4 rounded-t-xl hidden sm:block"></div>
              </div>
            )}

            {top3[2] && (
              <div className="order-3 sm:order-3 flex flex-col items-center w-full sm:w-1/3">
                <div className="text-xl mb-2">{getRankIcon(3)}</div>
                <div className={`w-16 h-16 mb-3 rounded-full border-4 shadow-md ${getPodiumColors(3)} overflow-hidden`}>
                  {top3[2].image ? (
                    <Image src={top3[2].image} alt={`Avatar de ${top3[2].name}`} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800"></div>
                  )}
                </div>
                <div className="font-bold text-slate-900 dark:text-white truncate w-full text-center">{top3[2].name}</div>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">{top3[2].totalScore} pts</div>
                <div className="w-full h-10 bg-gradient-to-t from-amber-200/50 to-transparent dark:from-amber-900/30 mt-4 rounded-t-xl hidden sm:block"></div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {restOfPlayers.map((player, index) => {
              const actualRank = index + 4;
              return (
                <div key={player.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-bold text-slate-400">#{actualRank}</span>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      {player.image && (
                        <Image src={player.image} alt={`Avatar de ${player.name}`} width={40} height={40} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{player.name}</span>
                  </div>
                  <div className="font-black text-indigo-600 dark:text-indigo-400">
                    {player.totalScore} <span className="text-xs text-slate-400">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {session && currentUserStats && currentUserStats.rank > 25 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
          <div className="mx-auto max-w-4xl bg-indigo-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border-2 border-indigo-400/30 pointer-events-auto backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-white/20 font-black">
                {currentUserStats.rank}
              </div>
              <div>
                <div className="font-bold">Votre position actuelle</div>
                <div className="text-sm text-indigo-200">Encore un effort pour atteindre le Top 25 !</div>
              </div>
            </div>
            <div className="font-black text-xl">
              {currentUserStats.totalScore} pts
            </div>
          </div>
        </div>
      )}
      
      {session && currentUserStats && currentUserStats.totalScore === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl whitespace-nowrap z-50">
          Vous n'avez pas encore joué {period === 'week' ? 'cette semaine' : period === 'month' ? 'ce mois-ci' : ''} !
        </div>
      )}
    </div>
  );
}