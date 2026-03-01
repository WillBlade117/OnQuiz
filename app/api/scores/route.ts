import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req) {
  try {
    const { player, theme, answers } = await req.json();

    if (!player || !theme || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    let calculatedScore = 0;
    const questionIds = answers.map((a) => a.questionId);

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => '?').join(',');
      const [dbQuestions] = await db.execute(
        `SELECT id, answers FROM questions WHERE id IN (${placeholders})`,
        questionIds
      );

      answers.forEach((userAns) => {
        const dbQ = (dbQuestions as any[]).find((q) => q.id === userAns.questionId);
        if (dbQ) {
          const parsedAnswers = JSON.parse(dbQ.answers);
          if (parsedAnswers[userAns.answerIndex]?.correct === true) {
            calculatedScore += 1;
          }
        }
      });
    }

    await db.execute(
      "INSERT INTO scores (player, score, theme) VALUES (?, ?, ?)",
      [player, calculatedScore, theme]
    );

    return NextResponse.json({ message: "Score enregistré !", score: calculatedScore });
  } catch (error) {
    console.error("Erreur API scores:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}