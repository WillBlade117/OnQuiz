import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { is_banned } = body;

    if (typeof is_banned !== "number") {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    await db.execute(
      "UPDATE users SET is_banned = ? WHERE id = ?",
      [is_banned, params.id]
    );

    return NextResponse.json({ message: "Statut de l'utilisateur mis à jour" }, { status: 200 });
  } catch (error) {
    console.error("Erreur de modification du statut:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}