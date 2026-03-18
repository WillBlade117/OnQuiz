import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin" || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const resolvedParams = await params;
    const targetId = resolvedParams.id;
    const body = await req.json();

    const [adminRows] = await db.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?", 
      [session.user.email]
    );
    const adminId = adminRows.length > 0 ? adminRows[0].id : null;

    if (body.action === "add_credits") {
      const amountToAdd = parseInt(body.amount, 10);
      if (isNaN(amountToAdd)) {
        return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
      }

      await db.execute("UPDATE users SET credits = credits + ? WHERE id = ?", [amountToAdd, targetId]);
      
      if (adminId) {
        await db.execute(
          "INSERT INTO audit_logs (user_id, action, target_id, details) VALUES (?, ?, ?, ?)",
          [adminId, "ADD_CREDITS", targetId, `A ajouté ${amountToAdd} crédits au joueur`]
        );
      }
      return NextResponse.json({ message: "Crédits ajoutés avec succès" });
    }

    if (body.action === "toggle_ban") {
      const { is_banned } = body;
      await db.execute("UPDATE users SET is_banned = ? WHERE id = ?", [is_banned ? 1 : 0, targetId]);
      
      if (adminId) {
        const actionType = is_banned ? "BAN_USER" : "UNBAN_USER";
        const actionDetails = is_banned ? "A banni le joueur" : "A débanni le joueur";
        await db.execute(
          "INSERT INTO audit_logs (user_id, action, target_id, details) VALUES (?, ?, ?, ?)",
          [adminId, actionType, targetId, actionDetails]
        );
      }
      return NextResponse.json({ message: "Statut mis à jour" });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });

  } catch (error) {
    console.error("Erreur API User PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}