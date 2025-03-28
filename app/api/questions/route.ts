import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const theme = url.searchParams.get("theme");
    if (!theme) {
      return NextResponse.json({ error: "Thème requis" }, { status: 400 });
    }

    const [questions] = await db.execute(
      "SELECT id, question, answers FROM questions WHERE theme = ? ORDER BY RAND() LIMIT 10",
      [theme]
    );

    const parsedQuestions: Question[] = (questions as any[]).map((question) => ({
      ...question,
      answers: JSON.parse(question.answers),
    }));

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error("Erreur API questions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
