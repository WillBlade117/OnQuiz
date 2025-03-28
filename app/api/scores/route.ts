import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req) {
  try {
    const { player, score, theme } = await req.json();
    if (!player || score === undefined || !theme) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await db.execute(
      "INSERT INTO scores (player, score, theme) VALUES (?, ?, ?)",
      [player, score, theme]
    );

    return NextResponse.json({ message: "Score enregistré !" });
  } catch (error) {
    console.error("Erreur API scores:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}