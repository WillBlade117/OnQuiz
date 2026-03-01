import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

interface ScoreRow extends RowDataPacket {
  player: string;
  score: number;
  theme: string;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  total: number;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const theme = url.searchParams.get("theme");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    let queryScores = "SELECT player, score, theme, created_at FROM scores ORDER BY score DESC LIMIT ? OFFSET ?";
    let queryCount = "SELECT COUNT(*) as total FROM scores";
    
    let paramsScores: (string | number)[] = [limit, offset];
    let paramsCount: string[] = [];

    if (theme) {
      queryScores = "SELECT player, score, theme, created_at FROM scores WHERE theme = ? ORDER BY score DESC LIMIT ? OFFSET ?";
      queryCount = "SELECT COUNT(*) as total FROM scores WHERE theme = ?";
      paramsScores = [theme, limit, offset];
      paramsCount = [theme];
    }

    const [scores] = await db.execute<ScoreRow[]>(queryScores, paramsScores);
    const [countResult] = await db.execute<CountRow[]>(queryCount, paramsCount);
    
    const total = countResult[0].total;

    return NextResponse.json({ scores, total });
  } catch (error) {
    console.error("Erreur API leaderboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}