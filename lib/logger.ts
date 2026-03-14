import { db } from "./db";

export async function logAction(
  userId: number | null,
  action: string,
  targetId: number | null = null,
  details: string | null = null
) {
  try {
    await db.execute(
      "INSERT INTO audit_logs (user_id, action, target_id, details) VALUES (?, ?, ?, ?)",
      [userId, action, targetId, details]
    );
  } catch (error) {
    console.error("Erreur d'écriture du log:", error);
  }
}