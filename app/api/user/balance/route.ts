import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({
        credits: 0,
        freeGamesLeft: 0,
        freeSuddenDeathLeft: 0,
      });

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id, credits FROM users WHERE email = ?",
      [session.user.email],
    );

    if (users.length === 0)
      return NextResponse.json({
        credits: 0,
        freeGamesLeft: 0,
        freeSuddenDeathLeft: 0,
      });

    const user = users[0];

    const [scores] = await db.execute<RowDataPacket[]>(
      `SELECT 
        SUM(CASE WHEN theme != 'mort-subite' THEN 1 ELSE 0 END) as classicGames,
        SUM(CASE WHEN theme = 'mort-subite' THEN 1 ELSE 0 END) as suddenDeathGames
       FROM scores 
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [user.id],
    );

    const classicGames = parseInt(scores[0].classicGames || 0);
    const suddenDeathGames = parseInt(scores[0].suddenDeathGames || 0);

    const freeGamesLeft = Math.max(0, 3 - classicGames);
    const freeSuddenDeathLeft = Math.max(0, 1 - suddenDeathGames); // 1 essai max par jour

    return NextResponse.json({
      credits: user.credits,
      freeGamesLeft,
      freeSuddenDeathLeft,
    });
  } catch (error) {
    console.error("Erreur Balance API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
