import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT DISTINCT theme FROM questions ORDER BY theme ASC"
    );
    
    const themes = rows.map((row) => row.theme);
    
    return NextResponse.json(themes);
  } catch (error) {
    console.error("Erreur API thèmes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}