import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { theme, question, answers } = body;

    if (!theme || !question || !answers || !Array.isArray(answers) || answers.length !== 4) {
      return NextResponse.json({ error: "Données invalides ou incomplètes" }, { status: 400 });
    }

    await db.execute(
      "INSERT INTO questions (theme, question, answers) VALUES (?, ?, ?)",
      [theme, question, JSON.stringify(answers)]
    );

    return NextResponse.json({ message: "Question ajoutée avec succès !" }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la question:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}