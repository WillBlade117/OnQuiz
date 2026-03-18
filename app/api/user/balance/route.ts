import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ credits: 0, freeGamesLeft: 0 });

    const [users] = await db.execute<RowDataPacket[]>(
      "SELECT id, credits FROM users WHERE email = ?", 
      [session.user.email]
    );
    
    if (users.length === 0) return NextResponse.json({ credits: 0, freeGamesLeft: 0 });

    const user = users[0];
    const [scores] = await db.execute<RowDataPacket[]>(
      "SELECT COUNT(id) as todayGames FROM scores WHERE user_id = ? AND DATE(created_at) = CURDATE()", 
      [user.id]
    );

    const todayGames = scores[0].todayGames;
    const freeGamesLeft = Math.max(0, 3 - todayGames);

    return NextResponse.json({ credits: user.credits, freeGamesLeft });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}