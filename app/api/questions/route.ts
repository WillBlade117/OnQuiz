import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";

interface QuestionRow extends RowDataPacket {
  id: number;
  question: string;
  answers: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const theme = url.searchParams.get("theme");
    if (!theme) {
      return NextResponse.json({ error: "Thème requis" }, { status: 400 });
    }

    const [questions] = await db.execute<QuestionRow[]>(
      "SELECT id, question, answers FROM questions WHERE theme = ? ORDER BY RAND() LIMIT 10",
      [theme]
    );

    const parsedQuestions = questions.map((q) => {
      const answersArray = JSON.parse(q.answers);
      return {
        id: q.id,
        question: q.question,
        answers: answersArray.map((ans: { text: string }) => ({ text: ans.text })),
      };
    });

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error("Erreur API questions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}