import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin" || !session.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Aucune question à importer" }, { status: 400 });
    }

    let importedCount = 0;

    for (const q of questions) {
      if (!q.theme || !q.question || !q.answers || q.answers.length !== 4) continue;

      const answersJson = JSON.stringify(q.answers);

      await db.execute(
        "INSERT INTO questions (theme, question, answers) VALUES (?, ?, ?)",
        [q.theme, q.question, answersJson]
      );
      importedCount++;
    }

    if (importedCount > 0) {
      const [adminRows] = await db.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [session.user.email]
      );

      if (adminRows.length > 0) {
        await db.execute(
          "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
          [adminRows[0].id, "IMPORT_QUESTIONS", `A importé ${importedCount} nouvelles questions via CSV`]
        );
      }
    }

    return NextResponse.json({ 
      message: `${importedCount} questions importées avec succès !`,
      count: importedCount
    });

  } catch (error) {
    console.error("Erreur API Import CSV:", error);
    return NextResponse.json({ error: "Erreur lors de l'importation" }, { status: 500 });
  }
}