import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

interface DBQuestionRow extends RowDataPacket {
  id: number;
  answers: string;
}

interface AnswerPayload {
  questionId: number;
  answerIndex: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player, theme, answers }: { player: string, theme: string, answers: AnswerPayload[] } = body;

    if (!player || !theme || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    let calculatedScore = 0;
    const questionIds = answers.map((a) => a.questionId);

    if (questionIds.length > 0) {
      const placeholders = questionIds.map(() => '?').join(',');
      const [dbQuestions] = await db.execute<DBQuestionRow[]>(
        `SELECT id, answers FROM questions WHERE id IN (${placeholders})`,
        questionIds
      );

      answers.forEach((userAns) => {
        const dbQ = dbQuestions.find((q) => q.id === userAns.questionId);
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