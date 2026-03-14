import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const session = await getServerSession(authOptions);
    
    const body = await req.json();
    const { player, theme, answers }: { player: string, theme: string, answers: AnswerPayload[] } = body;

    if (!theme || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    let userId = null;
    let finalPlayerName = player;

    if (session?.user?.email) {
      const [users] = await db.execute<RowDataPacket[]>(
        "SELECT id, name FROM users WHERE email = ?",
        [session.user.email]
      );
      if (users.length > 0) {
        userId = users[0].id;
        finalPlayerName = users[0].name;
      }
    }

    if (!finalPlayerName) {
      return NextResponse.json({ error: "Pseudo manquant" }, { status: 400 });
    }

    let calculatedScore = 0;
    const questionIds = answers.map((a) => a.questionId);

    if (questionIds.length > 0) {
      const [dbQuestions] = await db.query<DBQuestionRow[]>(
        `SELECT id, answers FROM questions WHERE id IN (?)`,
        [questionIds] 
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
      "INSERT INTO scores (player, score, theme, user_id) VALUES (?, ?, ?, ?)",
      [finalPlayerName, calculatedScore, theme, userId]
    );

    return NextResponse.json({ message: "Score enregistré !", score: calculatedScore });
  } catch (error) {
    console.error("Erreur API scores:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}