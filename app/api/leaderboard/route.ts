import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const theme = url.searchParams.get("theme");

    let query = "SELECT player, score, theme, created_at FROM scores ORDER BY created_at DESC";
    let params = [];

    if (theme) {
      query = "SELECT player, score, theme, created_at FROM scores WHERE theme = ? ORDER BY created_at DESC";
      params.push(theme);
    }

    const [scores] = await db.execute(query, params);

    return NextResponse.json(scores);
  } catch (error) {
    console.error("Erreur API leaderboard:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
