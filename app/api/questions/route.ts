import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { RowDataPacket } from "mysql2";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

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

    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const [users] = await db.execute<RowDataPacket[]>(
        "SELECT id, credits FROM users WHERE email = ?",
        [session.user.email]
      );
      
      if (users.length > 0) {
        const user = users[0];
        const userId = user.id;
        
        const [scores] = await db.execute<RowDataPacket[]>(
          "SELECT COUNT(id) as todayGames FROM scores WHERE user_id = ? AND DATE(created_at) = CURDATE()",
          [userId]
        );
        
        const todayGames = scores[0].todayGames;
        
        if (todayGames >= 3) {
          const [settings] = await db.execute<RowDataPacket[]>(
            "SELECT setting_value FROM settings WHERE setting_key = 'game_cost'"
          );
          const gameCost = settings.length > 0 ? parseInt(settings[0].setting_value) : 10;
          
          const confirmPay = url.searchParams.get("pay") === "true";

          if (!confirmPay) {
            return NextResponse.json(
              { error: "Paiement requis", code: "REQUIRES_PAYMENT", cost: gameCost }, 
              { status: 402 }
            );
          }

          if (user.credits >= gameCost) {
            await db.execute(
              "UPDATE users SET credits = credits - ? WHERE id = ?",
              [gameCost, userId]
            );
          } else {
            return NextResponse.json(
              { error: "Crédits insuffisants", code: "INSUFFICIENT_CREDITS", cost: gameCost }, 
              { status: 403 }
            );
          }
        }
      }
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