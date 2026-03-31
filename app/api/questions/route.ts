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

    // On détecte si on est dans le mode de jeu spécial
    const isSuddenDeath = theme === "mort-subite";
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      const [users] = await db.execute<RowDataPacket[]>(
        "SELECT id, credits FROM users WHERE email = ?",
        [session.user.email],
      );

      if (users.length > 0) {
        const user = users[0];
        const userId = user.id;

        // On sépare le comptage des parties du jour selon le mode
        const [scores] = await db.execute<RowDataPacket[]>(
          `SELECT 
            SUM(CASE WHEN theme != 'mort-subite' THEN 1 ELSE 0 END) as classicGames,
            SUM(CASE WHEN theme = 'mort-subite' THEN 1 ELSE 0 END) as suddenDeathGames
           FROM scores 
           WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
          [userId],
        );

        const gamesPlayed = isSuddenDeath
          ? parseInt(scores[0].suddenDeathGames || 0)
          : parseInt(scores[0].classicGames || 0);

        const maxFreeGames = isSuddenDeath ? 1 : 3;

        // Si le quota gratuit est dépassé, on déclenche le système de paiement
        if (gamesPlayed >= maxFreeGames) {
          const settingKey = isSuddenDeath ? "sudden_death_cost" : "game_cost";
          const defaultCost = isSuddenDeath ? 20 : 10;

          const [settings] = await db.execute<RowDataPacket[]>(
            "SELECT setting_value FROM settings WHERE setting_key = ?",
            [settingKey],
          );
          const gameCost =
            settings.length > 0
              ? parseInt(settings[0].setting_value)
              : defaultCost;

          const confirmPay = url.searchParams.get("pay") === "true";

          if (!confirmPay) {
            return NextResponse.json(
              {
                error: "Paiement requis",
                code: "REQUIRES_PAYMENT",
                cost: gameCost,
              },
              { status: 402 },
            );
          }

          if (user.credits >= gameCost) {
            await db.execute(
              "UPDATE users SET credits = credits - ? WHERE id = ?",
              [gameCost, userId],
            );
          } else {
            return NextResponse.json(
              {
                error: "Crédits insuffisants",
                code: "INSUFFICIENT_CREDITS",
                cost: gameCost,
              },
              { status: 403 },
            );
          }
        }
      }
    }

    let questions;

    // Si on est en mort subite, on prend 10 questions au hasard de TOUS les thèmes
    if (isSuddenDeath) {
      const [result] = await db.execute<QuestionRow[]>(
        "SELECT id, question, answers FROM questions ORDER BY RAND() LIMIT 10",
      );
      questions = result;
    }
    // Sinon, comportement classique pour un thème précis
    else {
      const [result] = await db.execute<QuestionRow[]>(
        "SELECT id, question, answers FROM questions WHERE theme = ? ORDER BY RAND() LIMIT 10",
        [theme],
      );
      questions = result;
    }

    const parsedQuestions = questions.map((q) => {
      const answersArray = JSON.parse(q.answers);
      return {
        id: q.id,
        question: q.question,
        answers: answersArray.map((ans: { text: string }) => ({
          text: ans.text,
        })),
      };
    });

    return NextResponse.json(parsedQuestions);
  } catch (error) {
    console.error("Erreur API questions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
