import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all";
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
    const [top50] = await db.execute<RowDataPacket[]>(top50Query);

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
            id: userId,
            name: session.user.name,
            image: session.user.image,
            totalScore: userTotal,
            rank: rankResult[0].userRank
          };
        }
      }
    }

    return NextResponse.json({ 
      leaderboard: top50, 
      currentUser: currentUserStats 
    });

  } catch (error) {
    console.error("Erreur API Leaderboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}