import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 1. Récupérer l'ID de l'utilisateur
    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const userId = users[0].id;

    // 2. Récupérer les statistiques globales
    const [statsResult] = await db.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(id) as totalGames, 
        COALESCE(SUM(score), 0) as totalScore, 
        COALESCE(MAX(score), 0) as bestScore 
       FROM scores WHERE user_id = ?`,
      [userId]
    );

    // 3. Trouver le thème favori
    const [favoriteThemeResult] = await db.execute<RowDataPacket[]>(
      `SELECT theme, COUNT(id) as playedCount 
       FROM scores WHERE user_id = ? 
       GROUP BY theme ORDER BY playedCount DESC LIMIT 1`,
      [userId]
    );

    // 4. Récupérer les 5 dernières parties pour l'historique
    const [recentGames] = await db.execute<RowDataPacket[]>(
      "SELECT theme, score, created_at FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId]
    );

    const stats = statsResult[0];
    const favoriteTheme = favoriteThemeResult.length > 0 ? favoriteThemeResult[0].theme : "Aucun";

    return NextResponse.json({
      totalGames: stats.totalGames,
      totalScore: stats.totalScore,
      bestScore: stats.bestScore,
      favoriteTheme: favoriteTheme,
      recentGames: recentGames
    });

  } catch (error) {
    console.error("Erreur API profil:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}