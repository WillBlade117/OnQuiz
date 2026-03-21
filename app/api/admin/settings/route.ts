import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin" || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const newCost = parseInt(body.game_cost, 10);

    if (isNaN(newCost) || newCost < 0) {
      return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
    }

    await db.execute(
      "INSERT INTO settings (setting_key, setting_value) VALUES ('game_cost', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [newCost.toString(), newCost.toString()]
    );

    const [adminRows] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?", [session.user.email]
    );
    if (adminRows.length > 0) {
      await db.execute(
        "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
        [adminRows[0].id, "UPDATE_SETTINGS", `A modifié le prix d'une partie à ${newCost} crédits`]
      );
    }

    return NextResponse.json({ message: "Réglages mis à jour" });
  } catch (error) {
    console.error("Erreur API Settings:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}