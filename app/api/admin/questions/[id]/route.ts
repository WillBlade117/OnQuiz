import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT id, theme, question, answers FROM questions WHERE id = ?",
      [params.id]
    );

    if (rows.length === 0) return NextResponse.json({ error: "Question introuvable" }, { status: 404 });

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const { theme, question, answers } = body;

    if (!theme || !question || !answers || !Array.isArray(answers) || answers.length !== 4) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    await db.execute(
      "UPDATE questions SET theme = ?, question = ?, answers = ? WHERE id = ?",
      [theme, question, JSON.stringify(answers), params.id]
    );

    return NextResponse.json({ message: "Question mise à jour" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await db.execute("DELETE FROM questions WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "Question supprimée" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}